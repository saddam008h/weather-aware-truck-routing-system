"""DRF serializers: they validate incoming JSON and shape outgoing JSON.

drf-spectacular also reads them to build the Swagger docs, so the docs always
match what the API really accepts and returns.
"""
from trips.serializers.heatmap import HeatmapSerializer
from trips.serializers.plan import PlaceSerializer, TripPlanSerializer
from trips.serializers.requests import GeocodeQuerySerializer, PlanRequestSerializer, TripRequestSerializer

__all__ = [
    "GeocodeQuerySerializer",
    "HeatmapSerializer",
    "PlaceSerializer",
    "PlanRequestSerializer",
    "TripPlanSerializer",
    "TripRequestSerializer",
]
