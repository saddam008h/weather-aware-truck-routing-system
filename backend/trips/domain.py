"""Plain data objects that the services pass around.

Nothing here talks to the network or the database. Serializers read these
objects directly when building API responses.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import IntEnum

# (latitude, longitude)
Point = tuple[float, float]


# An IntEnum so levels compare and sort naturally: max(levels) is the worst one,
# and the number doubles as the 0-4 risk score.
class RiskLevel(IntEnum):
    LOW = 0
    MODERATE = 1
    HIGH = 2
    SEVERE = 3
    NO_TRAVEL = 4

    @property
    def label(self) -> str:
        return self.name.lower()


# A named location, from geocoding or from "lat,lon" input.
@dataclass
class Place:
    name: str
    lat: float
    lon: float

    @property
    def point(self) -> Point:
        return (self.lat, self.lon)


# One drivable route as the router returned it, before we add weather.
@dataclass
class Route:
    points: list[Point]
    distance_m: float
    duration_s: float
    summary: str = ""
    # Seconds spent between each pair of consecutive points, when the router provides it.
    segment_durations: list[float] | None = None


# Forecast values for one place at one hour.
@dataclass
class WeatherSample:
    temperature_f: float
    wind_mph: float
    gust_mph: float
    rain_in_hr: float
    snow_in_hr: float


@dataclass
class HourlyForecast:
    """Hourly series for one location, starting at `first_hour` (unix seconds, UTC)."""

    first_hour: int
    temperature_f: list[float | None]
    wind_mph: list[float | None]
    gust_mph: list[float | None]
    rain_in_hr: list[float | None]
    snow_in_hr: list[float | None]

    def at(self, when: datetime) -> WeatherSample | None:
        """The forecast hour closest to `when`, or None if it's outside the series."""
        index = round((when.timestamp() - self.first_hour) / 3600)
        if not 0 <= index < len(self.wind_mph):
            return None

        values = (
            self.temperature_f[index],
            self.wind_mph[index],
            self.gust_mph[index],
            self.rain_in_hr[index],
            self.snow_in_hr[index],
        )
        # Open-Meteo sends nulls past the end of some models' range.
        if any(value is None for value in values):
            return None
        return WeatherSample(*values)


# Risk at one checkpoint: the overall level plus what each factor scored on its own.
@dataclass
class RiskAssessment:
    level: RiskLevel
    wind: RiskLevel
    rain: RiskLevel
    snow: RiskLevel
    # True when the load weight rules made the wind risk worse than wind alone.
    load_adjusted: bool = False


# A point on the route where weather is sampled. Weather and risk are
# filled in later; they stay None if the forecast doesn't reach the ETA.
@dataclass
class Checkpoint:
    mile: float
    lat: float
    lon: float
    eta: datetime
    weather: WeatherSample | None = None
    risk: RiskAssessment | None = None


# Risk totals for a whole route, used to rank routes against each other.
@dataclass
class RiskSummary:
    miles_by_level: dict[RiskLevel, float]
    average_score: float
    worst_level: RiskLevel
    unknown_miles: float = 0.0

    def miles(self, level: RiskLevel) -> float:
        return self.miles_by_level.get(level, 0.0)

    @property
    def miles_by_label(self) -> dict[str, float]:
        # Same numbers keyed by "low", "severe", ... for the JSON response.
        return {level.label: self.miles(level) for level in RiskLevel}


# A route with everything the frontend needs: line, checkpoints, risk.
@dataclass
class PlannedRoute:
    id: int
    summary: str
    distance_miles: float
    duration_minutes: float
    arrival_time: datetime
    geometry: list[Point]
    checkpoints: list[Checkpoint]
    risk: RiskSummary
    is_recommended: bool = False


# The full answer to a /plan request.
@dataclass
class TripPlan:
    origin: Place
    destination: Place
    departure_time: datetime
    load_weight_lbs: int
    sample_interval_miles: int
    routes: list[PlannedRoute]
    recommended_route_id: int
    recommendation: str
    warnings: list[str] = field(default_factory=list)


# One hour of the heatmap. Each list lines up with Heatmap.points by index.
@dataclass
class HeatmapFrame:
    hour: int
    time: datetime
    risk: list[int | None]
    wind_mph: list[float | None]
    rain_in_hr: list[float | None]
    snow_in_hr: list[float | None]


# The full answer to a /heatmap request: grid points plus one frame per hour.
@dataclass
class Heatmap:
    start_time: datetime
    points: list[Point]
    frames: list[HeatmapFrame]
