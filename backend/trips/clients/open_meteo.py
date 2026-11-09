"""Hourly forecasts from Open-Meteo (https://open-meteo.com)."""
from django.conf import settings

from trips.clients.http import get_json
from trips.domain import HourlyForecast, Point
from trips.exceptions import UpstreamServiceError

HOURLY_FIELDS = "temperature_2m,wind_speed_10m,wind_gusts_10m,rain,showers,snowfall"

# One day back so a departure from "an hour ago" still has data, and enough days
# ahead to cover a departure 7 days out plus a long trip or the 48h heatmap.
PAST_DAYS = 1
FORECAST_DAYS = 10


def fetch_hourly(points: list[Point]) -> list[HourlyForecast]:
    """Forecasts for several locations in one request, in the same order as `points`."""
    params = {
        # Open-Meteo takes comma-separated lists to look up many places at once.
        "latitude": ",".join(f"{lat:.2f}" for lat, _ in points),
        "longitude": ",".join(f"{lon:.2f}" for _, lon in points),
        "hourly": HOURLY_FIELDS,
        # Ask for the units the risk table uses, so no conversions are needed.
        "wind_speed_unit": "mph",
        "precipitation_unit": "inch",
        "temperature_unit": "fahrenheit",
        # Hours as UTC unix timestamps, easy to compare with our ETAs.
        "timezone": "GMT",
        "timeformat": "unixtime",
        "past_days": PAST_DAYS,
        "forecast_days": FORECAST_DAYS,
    }
    data = get_json(settings.OPEN_METEO_URL, params, service="Weather")

    # A single location comes back as an object, several as a list.
    if isinstance(data, dict):
        if data.get("error"):
            raise UpstreamServiceError(f"Weather lookup failed: {data.get('reason')}")
        data = [data]

    return [_to_forecast(item["hourly"]) for item in data]


def _to_forecast(hourly: dict) -> HourlyForecast:
    # Open-Meteo splits liquid precipitation into large-scale "rain" and
    # convective "showers"; the truck gets wet either way.
    rain = [_add(r, s) for r, s in zip(hourly["rain"], hourly["showers"])]
    return HourlyForecast(
        first_hour=hourly["time"][0],
        temperature_f=hourly["temperature_2m"],
        wind_mph=hourly["wind_speed_10m"],
        gust_mph=hourly["wind_gusts_10m"],
        rain_in_hr=rain,
        snow_in_hr=hourly["snowfall"],
    )


def _add(a: float | None, b: float | None) -> float | None:
    # Adds two values that may be missing; only None if both are.
    if a is None and b is None:
        return None
    return (a or 0.0) + (b or 0.0)
