"""Example request bodies that Swagger pre-fills under "Try it out".

They leave out departure_time on purpose, so it defaults to now and the
examples never go stale.
"""
from drf_spectacular.utils import OpenApiExample

DALLAS_TO_CHICAGO = OpenApiExample(
    "Dallas to Chicago, leaving now",
    value={
        "origin": "Dallas, TX",
        "destination": "Chicago, IL",
        "load_weight_lbs": 42000,
        "sample_interval_miles": 25,
    },
    request_only=True,
)

DENVER_TO_SALT_LAKE = OpenApiExample(
    "Denver to Salt Lake City, by coordinates",
    value={
        "origin": "39.7392,-104.9903",
        "destination": "40.7608,-111.8910",
        "load_weight_lbs": 28000,
        "sample_interval_miles": 10,
    },
    request_only=True,
)
