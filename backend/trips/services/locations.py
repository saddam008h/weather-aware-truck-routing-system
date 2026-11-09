"""Turning user input into coordinates, with caching in front of the geocoder."""
import hashlib
import re

from django.conf import settings
from django.core.cache import cache
from rest_framework.exceptions import ValidationError

from trips.clients import photon
from trips.domain import Place, Point
from trips.exceptions import LocationNotFound
from trips.geo import distance_miles

# Matches "32.77,-96.79" (spaces allowed around the comma).
COORDINATES = re.compile(r"^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$")


def resolve_endpoints(origin: str, destination: str) -> tuple[Place, Place]:
    """Both ends of the trip, rejecting the case where they're the same spot."""
    start = resolve(origin)
    end = resolve(destination)
    if distance_miles(start.point, end.point) < 0.5:
        raise ValidationError({"destination": ["Origin and destination are the same place."]})
    return start, end


def resolve(text: str) -> Place:
    """Turn what the user typed into a Place.

    Accepts plain "lat,lon" (what the frontend sends once a suggestion is
    picked) or any address / place name, which gets geocoded.
    """
    match = COORDINATES.match(text)
    if match:
        lat, lon = float(match[1]), float(match[2])
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise LocationNotFound(f'"{text}" is not a valid latitude,longitude pair.')
        return Place(name=f"{lat:.4f}, {lon:.4f}", lat=lat, lon=lon)

    results = search(text, limit=1)
    if not results:
        raise LocationNotFound(f'Couldn\'t find a location matching "{text}".')
    return results[0]


def country_at(point: Point) -> str | None:
    """Country code at a point, cached since borders don't move."""
    key = "country:{:.2f},{:.2f}".format(*point)
    code = cache.get(key)
    if code is None:
        # Cache misses as "" so we don't ask again for the middle of the ocean.
        code = photon.country_code(point) or ""
        cache.set(key, code, settings.GEOCODE_CACHE_SECONDS)
    return code or None


def search(query: str, limit: int = 5) -> list[Place]:
    # Cache keys can't safely hold spaces or odd characters, so hash the query.
    digest = hashlib.sha1(query.strip().lower().encode()).hexdigest()
    key = f"geocode:{limit}:{digest}"

    places = cache.get(key)
    if places is None:
        places = photon.search(query.strip(), limit=limit)
        cache.set(key, places, settings.GEOCODE_CACHE_SECONDS)
    return places
