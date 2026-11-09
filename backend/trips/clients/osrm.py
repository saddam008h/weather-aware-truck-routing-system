"""Driving routes from an OSRM server (http://project-osrm.org)."""
from django.conf import settings

from trips.clients.http import get_json
from trips.domain import Point, Route
from trips.exceptions import NoRouteFound, UpstreamServiceError


def fetch_routes(waypoints: list[Point], alternatives: int = 0) -> list[Route]:
    """Routes through `waypoints` in order, fastest first."""
    # OSRM wants "lon,lat;lon,lat;..." in the URL path.
    coordinates = ";".join(f"{lon:.5f},{lat:.5f}" for lat, lon in waypoints)
    params = {
        "overview": "full",  # every point of the line, not a simplified version
        "geometries": "geojson",
        "annotations": "duration",  # seconds for each small segment, used for ETAs
        # Steps are only requested because OSRM leaves the leg summary
        # ("I 35, I 44") empty without them.
        "steps": "true",
        "alternatives": alternatives or "false",
    }
    data = get_json(
        f"{settings.OSRM_URL}/route/v1/driving/{coordinates}",
        params,
        service="Routing",
    )

    # OSRM reports problems in a "code" field rather than only via HTTP status.
    code = data.get("code")
    if code in ("NoRoute", "NoSegment"):
        raise NoRouteFound()
    if code != "Ok":
        raise UpstreamServiceError(f"Routing failed: {data.get('message') or code}")

    return [_to_route(raw) for raw in data["routes"]]


def _to_route(raw: dict) -> Route:
    # GeoJSON is [lon, lat]; the rest of the code uses (lat, lon).
    points = [(lat, lon) for lon, lat in raw["geometry"]["coordinates"]]
    legs = raw["legs"]

    durations = [seconds for leg in legs for seconds in leg["annotation"]["duration"]]
    # Each leg's annotation covers the leg's own points; the overview line shares
    # the joining point between legs, so the counts should line up exactly.
    if len(durations) != len(points) - 1:
        durations = None

    # Summaries look like "I 35, I 44; US 412". A ";" joins the numbers of one
    # road that carries several routes, and the first one is enough for a label.
    road_names = [
        name.split(";")[0].strip()
        for leg in legs
        for name in leg.get("summary", "").split(", ")
        if name
    ]
    # dict.fromkeys drops repeats but keeps the order.
    summary = ", ".join(dict.fromkeys(road_names))

    return Route(
        points=points,
        distance_m=raw["distance"],
        duration_s=raw["duration"],
        summary=summary,
        segment_durations=durations,
    )
