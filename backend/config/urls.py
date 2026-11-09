"""Top-level URL routing. Django tries these patterns in order for every request."""
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Opening the bare domain lands on the API docs.
    path("", RedirectView.as_view(pattern_name="swagger-ui")),
    # All app endpoints live under /api/ (see trips/urls.py).
    path("api/", include("trips.urls")),
    # Raw OpenAPI schema, and the Swagger UI page that reads it.
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
