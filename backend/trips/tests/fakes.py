"""Stand-ins for the third-party APIs so tests run offline and predictably.

The fake world: three routes from (40, -100) to (40, -98).
  route A goes straight east along latitude 40 (fastest)
  route B bends north through (40.5, -99)
  route C bends south through (39.5, -99)
Weather is calm everywhere except a windy strip on the middle of route A
and steady rain around route C.
"""
from datetime import datetime, timedelta, timezone

from trips.domain import HourlyForecast, Place, Route
from trips.geo import METERS_PER_MILE, cumulative_miles

ORIGIN = Place(name="Origin, Kansas", lat=40.0, lon=-100.0)
DESTINATION = Place(name="Destination, Kansas", lat=40.0, lon=-98.0)

WINDY_MPH = 38
RAIN_IN_HR = 0.3


def _route(middle, minutes):
    points = [ORIGIN.point, middle, DESTINATION.point]
    miles = cumulative_miles(points)[-1]
    return Route(
        points=points,
        distance_m=miles * METERS_PER_MILE,
        duration_s=minutes * 60,
        summary="Test Highway",
    )


ROUTES = [
    _route((40.0, -99.0), minutes=100),
    _route((40.5, -99.0), minutes=115),
    _route((39.5, -99.0), minutes=130),
]


def fetch_routes(waypoints, alternatives=0):
    return list(ROUTES)


def search(query, limit=5):
    return {"origin": [ORIGIN], "destination": [DESTINATION]}.get(query.lower(), [])[:limit]


def country_code(point):
    return "US"


def fetch_hourly(points):
    return [_forecast(lat, lon) for lat, lon in points]


def _forecast(lat, lon):
    wind = rain = 0.0
    if abs(lat - 40.0) < 0.05 and -99.8 < lon < -98.2:
        wind = WINDY_MPH
    if lat < 39.85:
        rain = RAIN_IN_HR

    start = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0) - timedelta(days=1)
    hours = 24 * 11
    return HourlyForecast(
        first_hour=int(start.timestamp()),
        temperature_f=[50.0] * hours,
        wind_mph=[wind] * hours,
        gust_mph=[wind + 5] * hours,
        rain_in_hr=[rain] * hours,
        snow_in_hr=[0.0] * hours,
    )
