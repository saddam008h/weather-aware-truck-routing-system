"""Builds the frontend's demo trip: real routes, made-up weather.

Runs the normal planner and heatmap code, but swaps the Open-Meteo client for
a few scripted storms so the demo always has risky stretches to show, whatever
today's real forecast looks like. Writes two JSON files the frontend serves as-is:

    python manage.py build_demo_trip
"""
import json
import math
from datetime import datetime, timedelta, timezone
from unittest import mock

from django.conf import settings
from django.core.management.base import BaseCommand

from trips.domain import HourlyForecast
from trips.geo import distance_miles
from trips.serializers import HeatmapSerializer, TripPlanSerializer
from trips.services.heatmap import build_heatmap
from trips.services.trip_planner import plan_trip

OUTPUT_DIR = settings.BASE_DIR.parent / "frontend" / "public" / "demo"

TRIP = {"origin": "Dallas, TX", "destination": "Chicago, IL", "load_weight_lbs": 42_000}
DEPARTURE = datetime(2026, 11, 12, 14, 0, tzinfo=timezone.utc)  # Thursday 8 AM in Dallas

# Each storm drifts from `start` to `end` between the two hours (counted from
# departure), strongest at its centre and fading out over FADE_HOURS either side.
STORMS = [
    # Wind storm over Arkansas, just as the I-30 / Little Rock route passes through. Tops out
    # around 53 mph: No Travel only because of the 42,000 lb load (a light truck would get Severe).
    {"kind": "wind", "peak": 44, "radius": 65, "start": (33.6, -94.8), "end": (35.6, -89.4), "hours": (0, 12)},
    # Rain band sweeping across Missouri along I-44.
    {"kind": "rain", "peak": 0.32, "radius": 60, "start": (36.0, -96.6), "end": (38.9, -89.4), "hours": (0, 16)},
    # Evening snow around Chicago, which every route has to drive into.
    {"kind": "snow", "peak": 0.8, "radius": 70, "start": (41.3, -88.8), "end": (42.1, -87.3), "hours": (12, 26)},
]
FADE_HOURS = 3
CALM_WIND_MPH = 9


def storm_strength(storm, lat, lon, hour):
    first, last = storm["hours"]
    if hour < first:
        fade = 1 - (first - hour) / FADE_HOURS
    elif hour > last:
        fade = 1 - (hour - last) / FADE_HOURS
    else:
        fade = 1
    if fade <= 0:
        return 0.0

    # Where the storm's centre is at this hour.
    progress = min(max((hour - first) / (last - first), 0), 1)
    centre_lat = storm["start"][0] + (storm["end"][0] - storm["start"][0]) * progress
    centre_lon = storm["start"][1] + (storm["end"][1] - storm["start"][1]) * progress

    distance = distance_miles((lat, lon), (centre_lat, centre_lon))
    return storm["peak"] * fade * math.exp(-((distance / storm["radius"]) ** 2))


def fake_forecast(lat, lon, first_hour):
    hours = range(24 * 11)
    series = {"temperature_f": [], "wind_mph": [], "gust_mph": [], "rain_in_hr": [], "snow_in_hr": []}

    for index in hours:
        hour = (first_hour + index * 3600 - DEPARTURE.timestamp()) / 3600
        totals = {"wind": 0.0, "rain": 0.0, "snow": 0.0}
        for storm in STORMS:
            totals[storm["kind"]] += storm_strength(storm, lat, lon, hour)

        wind = CALM_WIND_MPH + totals["wind"]
        series["wind_mph"].append(round(wind, 1))
        series["gust_mph"].append(round(wind * 1.4, 1))
        series["rain_in_hr"].append(round(totals["rain"], 3))
        series["snow_in_hr"].append(round(totals["snow"], 3))
        # Colder further north, and below freezing under the snow.
        series["temperature_f"].append(round(72 - 2 * (lat - 32) - 20 * min(totals["snow"], 1), 1))

    return HourlyForecast(first_hour=first_hour, **series)


def fake_fetch_hourly(points):
    first_hour = int((DEPARTURE - timedelta(days=1)).timestamp())
    return [fake_forecast(lat, lon, first_hour) for lat, lon in points]


class Command(BaseCommand):
    help = "Writes frontend/public/demo/trip-plan.json and trip-heatmap.json (real routes, scripted storms)."

    def handle(self, *args, **options):
        # Routes and geocoding still come from the real services; only the weather is scripted.
        with mock.patch("trips.clients.open_meteo.fetch_hourly", fake_fetch_hourly):
            plan = plan_trip(**TRIP, departure_time=DEPARTURE, sample_interval_miles=25)
            heatmap = build_heatmap(**TRIP, departure_time=DEPARTURE)

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        for name, data in [
            ("trip-plan.json", TripPlanSerializer(plan).data),
            ("trip-heatmap.json", HeatmapSerializer(heatmap).data),
        ]:
            (OUTPUT_DIR / name).write_text(json.dumps(data, separators=(",", ":")))

        self.stdout.write(f"Recommended route {plan.recommended_route_id}: {plan.recommendation}")
        for route in plan.routes:
            miles = {level: round(value) for level, value in route.risk.miles_by_label.items() if value}
            self.stdout.write(f"  Route {route.id} ({route.summary}): {miles}")
        self.stdout.write(self.style.SUCCESS(f"Wrote demo files to {OUTPUT_DIR}"))
