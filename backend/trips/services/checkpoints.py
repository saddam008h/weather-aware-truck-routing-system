"""Placing checkpoints along a route and working out when the truck reaches each one."""
from datetime import datetime, timedelta
from itertools import accumulate

from trips.domain import Checkpoint, Route
from trips.geo import METERS_PER_MILE, cumulative_miles, interpolate, locate


def sample_checkpoints(route: Route, interval_miles: float, departure: datetime) -> list[Checkpoint]:
    """Checkpoints every `interval_miles` along the route, with the truck's ETA at each.

    The origin and destination are always included.
    """
    # Both lists line up with route.points: miles driven and seconds elapsed at each point.
    miles = _route_miles(route)
    seconds = _elapsed_seconds(route, miles)

    checkpoints = []
    for mark in checkpoint_miles(miles[-1], interval_miles):
        # Find the two route points either side of this mile marker...
        index, fraction = locate(miles, mark)
        # ...and blend between them for both position and time.
        lat, lon = interpolate(route.points[index], route.points[index + 1], fraction)
        elapsed = seconds[index] + (seconds[index + 1] - seconds[index]) * fraction
        checkpoints.append(
            Checkpoint(mile=mark, lat=lat, lon=lon, eta=departure + timedelta(seconds=elapsed))
        )
    return checkpoints


def checkpoint_miles(total: float, interval: float) -> list[float]:
    """Mile markers 0, interval, 2*interval, ... plus the destination."""
    marks = [interval * n for n in range(int(total // interval) + 1)]
    # Skip a regular checkpoint that lands right before the destination, so the
    # last two don't sit on top of each other on the map.
    if len(marks) > 1 and total - marks[-1] < interval * 0.1:
        marks.pop()
    marks.append(total)
    return marks


def _route_miles(route: Route) -> list[float]:
    miles = cumulative_miles(route.points)
    # Summing haversine distances over the line comes out slightly different
    # from the router's own distance. Scale so the two agree at the destination.
    if miles[-1] > 0:
        scale = (route.distance_m / METERS_PER_MILE) / miles[-1]
        miles = [m * scale for m in miles]
    return miles


def _elapsed_seconds(route: Route, miles: list[float]) -> list[float]:
    if route.segment_durations:
        # Running total of OSRM's per-segment times: slow in cities, fast on interstates.
        elapsed = list(accumulate(route.segment_durations, initial=0.0))
        # Those times leave out turns, so they add up to a few minutes less than the
        # route's own duration. Scale them so the last ETA is the arrival time.
        if elapsed[-1] > 0:
            scale = route.duration_s / elapsed[-1]
            elapsed = [seconds * scale for seconds in elapsed]
        return elapsed

    # Without per-segment timings, assume a constant average speed.
    total = miles[-1] or 1.0
    return [route.duration_s * m / total for m in miles]
