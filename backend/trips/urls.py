from django.urls import path

from trips import views

# Mounted under /api/ by config/urls.py, so "trips/plan/" is really /api/trips/plan/.
# The names are used by reverse() in the tests.
urlpatterns = [
    path("health/", views.HealthView.as_view(), name="health"),
    path("geocode/", views.GeocodeView.as_view(), name="geocode"),
    path("trips/plan/", views.TripPlanView.as_view(), name="trip-plan"),
    path("trips/heatmap/", views.TripHeatmapView.as_view(), name="trip-heatmap"),
]
