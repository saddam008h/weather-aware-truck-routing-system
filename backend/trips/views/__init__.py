"""HTTP endpoints, one file each.

Views stay thin: validate the input with a serializer, call a service, and
serialize the result. The @extend_schema decorators only feed the Swagger docs.
"""
from trips.views.geocode import GeocodeView
from trips.views.health import HealthView
from trips.views.heatmap import TripHeatmapView
from trips.views.plan import TripPlanView

__all__ = ["GeocodeView", "HealthView", "TripHeatmapView", "TripPlanView"]
