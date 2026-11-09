"""Finding three genuinely different routes between two points."""
from concurrent.futures import ThreadPoolExecutor

from django.conf import settings
from django.core.cache import cache

from trips.clients import osrm
from trips.domain import Point, Route
from trips.exceptions import NoRouteFound
from trips.geo import offset_midpoint, overlap_ratio, retraced_miles
from trips.services.locations import country_at

ROUTE_COUNT = 3

# How far to push detour waypoints off the direct line, as a share of the trip
# length. Each offset is tried on both sides.
DETOUR_OFFSETS = (0.1, 0.2, 0.3)

# Detours up to 1.5x the fastest time are taken right away. Slower ones (up to
# 2x) are only used if nothing better turns up. Waypoints that snap onto dirt
# roads in the desert easily produce 3x routes, and those are never worth showing.
PREFERRED_SLOWDOWN = 1.5
MAX_SLOWDOWN = 2.0

# Routes sharing more than this share of their length count as the same option.
MAX_OVERLAP = 0.8

# A waypoint that lands on a dead-end road makes the route drive in and back out.
MAX_RETRACED_MILES = 3.0


def find_routes(origin: Point, destination: Point) -> list[Route]:
    """Up to three distinct routes, fastest first."""
    # Cached because the heatmap request right after the plan needs the same routes.
    key = "routes:{:.4f},{:.4f}:{:.4f},{:.4f}".format(*origin, *destination)
    routes = cache.get(key)
    if routes is None:
        routes = _find_routes(origin, destination)
        cache.set(key, routes, settings.ROUTE_CACHE_SECONDS)
    return routes


def _find_routes(origin: Point, destination: Point) -> list[Route]:
    routes = osrm.fetch_routes([origin, destination], alternatives=ROUTE_COUNT)[:ROUTE_COUNT]
    # "Ok" with an empty list shouldn't happen, but would otherwise crash just below.
    if not routes:
        raise NoRouteFound()
    fastest = routes[0].duration_s
    slow_detours = []

    # OSRM often finds fewer alternatives than we ask for, especially on short
    # trips. Fill the gap by forcing a route through a point off to one side.
    for offset in DETOUR_OFFSETS:
        for via, candidate in _detours(origin, destination, offset):
            if len(routes) >= ROUTE_COUNT:
                break

            # Cheap checks first; the country check costs a network call.
            slowdown = candidate.duration_s / fastest
            if slowdown > MAX_SLOWDOWN or retraced_miles(candidate.points) > MAX_RETRACED_MILES:
                continue
            if not _is_distinct(candidate, routes) or not _stays_in_country(via, origin, destination):
                continue

            if slowdown <= PREFERRED_SLOWDOWN:
                routes.append(candidate)
            else:
                slow_detours.append(candidate)

        if len(routes) >= ROUTE_COUNT:
            break

    # Still short? Fall back to the slower detours, quickest first.
    for candidate in sorted(slow_detours, key=lambda route: route.duration_s):
        if len(routes) >= ROUTE_COUNT:
            break
        if _is_distinct(candidate, routes):
            routes.append(candidate)

    # A detour can beat one of OSRM's own alternatives, so re-sort by time.
    return sorted(routes, key=lambda route: route.duration_s)


def _detours(origin: Point, destination: Point, offset: float) -> list[tuple[Point, Route]]:
    """Routes forced through a waypoint on the left and on the right of the direct line.

    Both sides are fetched together. The public OSRM server asks for about one
    request per second, so this is as much parallelism as we allow ourselves.
    """
    vias = [offset_midpoint(origin, destination, side * offset) for side in (1, -1)]

    def fetch(via: Point) -> Route | None:
        try:
            return osrm.fetch_routes([origin, via, destination])[0]
        except NoRouteFound:
            # The waypoint landed somewhere unreachable (open water, say).
            return None

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(fetch, vias))
    return [(via, route) for via, route in zip(vias, results) if route is not None]


def _is_distinct(candidate: Route, routes: list[Route]) -> bool:
    return all(overlap_ratio(candidate.points, route.points) < MAX_OVERLAP for route in routes)


def _stays_in_country(via: Point, origin: Point, destination: Point) -> bool:
    # Near a border the waypoint can land on the wrong side, and a route from
    # LA to Phoenix through Mexico is not a real option for a truck.
    via_country = country_at(via)
    return via_country is None or via_country in {country_at(origin), country_at(destination)}
