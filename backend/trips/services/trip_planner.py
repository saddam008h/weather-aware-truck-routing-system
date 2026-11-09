"""Everything behind POST /api/trips/plan/, wired together."""
from datetime import datetime, timedelta

from trips.domain import Checkpoint, PlannedRoute, RiskLevel, Route, TripPlan
from trips.geo import METERS_PER_MILE, simplify
from trips.services import weather
from trips.services.checkpoints import sample_checkpoints
from trips.services.locations import resolve_endpoints
from trips.services.ranking import recommend, summarize_risk
from trips.services.risk import assess
from trips.services.routes import ROUTE_COUNT, find_routes


def plan_trip(
    origin: str,
    destination: str,
    departure_time: datetime,
    load_weight_lbs: int,
    sample_interval_miles: int,
) -> TripPlan:
    start, end = resolve_endpoints(origin, destination)
    routes = find_routes(start.point, end.point)

    # Checkpoints for every route, then one weather lookup for all of them at
    # once so the batching and caching in services/weather.py can do their job.
    checkpoints = [sample_checkpoints(route, sample_interval_miles, departure_time) for route in routes]
    _attach_weather([cp for route_checkpoints in checkpoints for cp in route_checkpoints], load_weight_lbs)

    # Number the routes 1, 2, 3 (fastest first) for the UI and the explanation text.
    planned = [
        _planned_route(number, route, route_checkpoints, departure_time)
        for number, (route, route_checkpoints) in enumerate(zip(routes, checkpoints), start=1)
    ]
    best, reason = recommend(planned)
    best.is_recommended = True

    return TripPlan(
        origin=start,
        destination=end,
        departure_time=departure_time,
        load_weight_lbs=load_weight_lbs,
        sample_interval_miles=sample_interval_miles,
        routes=planned,
        recommended_route_id=best.id,
        recommendation=reason,
        warnings=_warnings(best, planned),
    )


def _attach_weather(checkpoints: list[Checkpoint], load_weight_lbs: int) -> None:
    """Fills in weather and risk on each checkpoint, using the forecast for its ETA."""
    samples = weather.samples_at([((cp.lat, cp.lon), cp.eta) for cp in checkpoints])
    for checkpoint, sample in zip(checkpoints, samples):
        checkpoint.weather = sample
        if sample is not None:
            checkpoint.risk = assess(sample, load_weight_lbs)


def _planned_route(number: int, route: Route, checkpoints: list[Checkpoint], departure: datetime) -> PlannedRoute:
    distance = route.distance_m / METERS_PER_MILE
    return PlannedRoute(
        id=number,
        summary=route.summary,
        distance_miles=distance,
        duration_minutes=route.duration_s / 60,
        arrival_time=departure + timedelta(seconds=route.duration_s),
        # The raw line can have 10k+ points; simplifying keeps the response small
        # and the map fast, and 5 decimals is about 1 m precision.
        geometry=[(round(lat, 5), round(lon, 5)) for lat, lon in simplify(route.points)],
        checkpoints=checkpoints,
        risk=summarize_risk(checkpoints, distance),
    )


def _warnings(best: PlannedRoute, routes: list[PlannedRoute]) -> list[str]:
    """Things the driver should know that don't fit anywhere else in the response."""
    warnings = []
    if len(routes) < ROUTE_COUNT:
        warnings.append(f"Only {len(routes)} reasonable route(s) exist between these locations.")
    # If even the best route hits No Travel, every route does.
    if best.risk.miles(RiskLevel.NO_TRAVEL) > 0:
        warnings.append(
            "Every route runs into No Travel conditions at this departure time. "
            "Consider leaving later."
        )
    if any(route.risk.unknown_miles > 0 for route in routes):
        warnings.append("Part of the trip is beyond the available forecast, so its risk is unknown.")
    return warnings
