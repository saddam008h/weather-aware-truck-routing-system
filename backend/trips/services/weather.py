"""Forecast lookups for many points at once, batched and cached."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from django.conf import settings
from django.core.cache import cache

from trips.clients import open_meteo
from trips.domain import HourlyForecast, Point, WeatherSample

# Forecasts are looked up on a 0.1 degree grid (~7 miles). That's close to the
# resolution of the weather models themselves, and it lets nearby checkpoints
# (and overlapping routes) share a single lookup.
GRID_DECIMALS = 1
BATCH_SIZE = 100  # locations per Open-Meteo request
MAX_PARALLEL_REQUESTS = 4


def grid_key(point: Point) -> Point:
    return (round(point[0], GRID_DECIMALS), round(point[1], GRID_DECIMALS))


def forecasts_for(points: list[Point]) -> dict[Point, HourlyForecast]:
    """Hourly forecasts keyed by grid_key(point). Cached for a while per grid cell."""
    # Unique grid cells, in order. Many points usually collapse into the same cell.
    keys = list(dict.fromkeys(grid_key(point) for point in points))
    cache_keys = {key: f"forecast:{key[0]}:{key[1]}" for key in keys}

    # Grab whatever is already cached in one go.
    cached = cache.get_many(cache_keys.values())
    forecasts = {key: cached[ck] for key, ck in cache_keys.items() if ck in cached}

    # Fetch the rest in batches, a few batches at a time.
    missing = [key for key in keys if key not in forecasts]
    batches = [missing[i:i + BATCH_SIZE] for i in range(0, len(missing), BATCH_SIZE)]

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as pool:
        # pool.map keeps results in the same order as `batches`.
        for batch, results in zip(batches, pool.map(open_meteo.fetch_hourly, batches)):
            fresh = dict(zip(batch, results))
            forecasts.update(fresh)
            cache.set_many(
                {cache_keys[key]: forecast for key, forecast in fresh.items()},
                settings.WEATHER_CACHE_SECONDS,
            )

    return forecasts


def samples_at(stops: list[tuple[Point, datetime]]) -> list[WeatherSample | None]:
    """Forecast for each (point, time) pair. None where no forecast covers that hour."""
    forecasts = forecasts_for([point for point, _ in stops])
    return [forecasts[grid_key(point)].at(when) for point, when in stops]
