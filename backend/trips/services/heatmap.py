"""Weather grid along the trip corridor for the 0-48h forecast slider."""
import math
from datetime import datetime, timedelta

from trips.domain import Heatmap, HeatmapFrame, HourlyForecast, Point
from trips.geo import resample
from trips.services import weather
from trips.services.locations import resolve_endpoints
from trips.services.risk import assess
from trips.services.routes import find_routes

HOURS = 48

# Grid cell sizes to try, in degrees of latitude. We start fine and go coarser
# until the corridor fits in MAX_POINTS cells, which keeps long trips from
# blowing through the weather API's rate limit.
CELL_SIZES = (0.25, 0.35, 0.5, 0.75, 1.0)
MAX_POINTS = 300


def build_heatmap(origin: str, destination: str, departure_time: datetime, load_weight_lbs: int) -> Heatmap:
    start, end = resolve_endpoints(origin, destination)
    # Usually a cache hit: the frontend asks for the plan first.
    routes = find_routes(start.point, end.point)

    points = corridor_grid([route.points for route in routes])
    forecasts = weather.forecasts_for(points)
    # One hourly series per grid point, in the same order as `points`.
    series = [forecasts[weather.grid_key(point)] for point in points]

    # Hour 0 is the departure hour, so the slider reads "hours after leaving".
    first_hour = departure_time.replace(minute=0, second=0, microsecond=0)
    frames = [
        _frame(hour, first_hour + timedelta(hours=hour), series, load_weight_lbs)
        for hour in range(HOURS + 1)
    ]
    return Heatmap(start_time=first_hour, points=points, frames=frames)


def corridor_grid(lines: list[list[Point]]) -> list[Point]:
    """Centers of the grid cells the routes pass through, plus one cell either side."""
    samples = [point for line in lines for point in resample(line, 5)]
    mid_lat = sum(lat for lat, _ in samples) / len(samples)
    # Make cells roughly square on the ground instead of square in degrees.
    lon_stretch = 1 / math.cos(math.radians(mid_lat))

    for size in CELL_SIZES:
        cells = _cells_touched(samples, size, size * lon_stretch)
        if len(cells) <= MAX_POINTS:
            break

    # Turn (row, col) cell indexes back into lat/lon at the cell centers.
    return [
        (round(row * size, 4), round(col * size * lon_stretch, 4))
        for row, col in sorted(cells)
    ]


def _cells_touched(samples: list[Point], lat_step: float, lon_step: float) -> set[tuple[int, int]]:
    # The cell under each sample plus its 8 neighbours, so the corridor is 3 cells wide.
    cells = set()
    for lat, lon in samples:
        row, col = round(lat / lat_step), round(lon / lon_step)
        for d_row in (-1, 0, 1):
            for d_col in (-1, 0, 1):
                cells.add((row + d_row, col + d_col))
    return cells


def _frame(hour: int, when: datetime, series: list[HourlyForecast], load_weight_lbs: int) -> HeatmapFrame:
    """Weather and risk at every grid point for one hour of the slider."""
    risk, wind, rain, snow = [], [], [], []
    for forecast in series:
        sample = forecast.at(when)
        # Keep a slot even with no data so every list stays aligned with the points.
        if sample is None:
            risk.append(None)
            wind.append(None)
            rain.append(None)
            snow.append(None)
            continue
        risk.append(int(assess(sample, load_weight_lbs).level))
        wind.append(sample.wind_mph)
        rain.append(sample.rain_in_hr)
        snow.append(sample.snow_in_hr)

    return HeatmapFrame(hour=hour, time=when, risk=risk, wind_mph=wind, rain_in_hr=rain, snow_in_hr=snow)
