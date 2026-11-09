"""Geocoding through Photon (https://photon.komoot.io), an OpenStreetMap search API."""
from django.conf import settings

from trips.clients.http import get_json
from trips.domain import Place, Point


def search(query: str, limit: int = 5) -> list[Place]:
    """Places matching free text like "Dallas, TX", best match first."""
    data = get_json(
        f"{settings.PHOTON_URL}/api/",
        # Ask for a few extra since duplicates get dropped below.
        {"q": query, "limit": limit + 3, "lang": "en"},
        service="Geocoding",
    )

    # OSM often has a town twice (the city node and its boundary), which would
    # show up as two identical suggestions. Keep the first, best-ranked one.
    places = {}
    for feature in data.get("features", []):
        place = _to_place(feature)
        places.setdefault(place.name, place)
    return list(places.values())[:limit]


def country_code(point: Point) -> str | None:
    """ISO country code ("US", "MX", ...) of whatever is closest to `point`."""
    data = get_json(
        f"{settings.PHOTON_URL}/reverse",
        # Default search radius is tiny; out in the desert nothing is that close.
        {"lat": point[0], "lon": point[1], "limit": 1, "radius": 50},
        service="Geocoding",
    )
    features = data.get("features") or []
    return features[0]["properties"].get("countrycode") if features else None


def _to_place(feature: dict) -> Place:
    # Results are GeoJSON, which puts longitude first.
    lon, lat = feature["geometry"]["coordinates"]
    return Place(name=_label(feature["properties"]), lat=lat, lon=lon)


def _label(props: dict) -> str:
    # Builds "Dallas, Texas, United States" or "123 Main St, Austin, Texas, ...".
    # Photon often repeats the name as the city, so duplicates are skipped.
    street = " ".join(filter(None, [props.get("housenumber"), props.get("street")]))
    parts = [props.get("name") or street, props.get("city"), props.get("state"), props.get("country")]

    label = []
    for part in parts:
        if part and part not in label:
            label.append(part)
    return ", ".join(label) or "Unnamed place"
