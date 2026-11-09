"""Weather risk rules from the assessment brief.

Where two bands share an edge (rain at exactly 0.25 in/hr, say) the value goes
into the more dangerous band. "No Travel" for rain and snow starts strictly
above 1.00 and 3.0, matching the ">" in the table.
"""
from trips.domain import RiskAssessment, RiskLevel, WeatherSample


def wind_level(mph: float, load_lbs: int) -> RiskLevel:
    # The load rules only change the two bands below 55 mph:
    #   45-54 mph with more than 30,000 lb -> No Travel
    #   35-44 mph with more than 40,000 lb -> Severe
    if mph >= 55:
        return RiskLevel.NO_TRAVEL
    if mph >= 45:
        return RiskLevel.NO_TRAVEL if load_lbs > 30_000 else RiskLevel.SEVERE
    if mph >= 35:
        return RiskLevel.SEVERE if load_lbs > 40_000 else RiskLevel.HIGH
    if mph >= 25:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


def rain_level(inches_per_hour: float) -> RiskLevel:
    if inches_per_hour > 1.0:
        return RiskLevel.NO_TRAVEL
    if inches_per_hour >= 0.5:
        return RiskLevel.SEVERE
    if inches_per_hour >= 0.25:
        return RiskLevel.HIGH
    if inches_per_hour >= 0.1:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


def snow_level(inches_per_hour: float) -> RiskLevel:
    if inches_per_hour > 3.0:
        return RiskLevel.NO_TRAVEL
    if inches_per_hour >= 2.0:
        return RiskLevel.SEVERE
    if inches_per_hour >= 1.0:
        return RiskLevel.HIGH
    if inches_per_hour >= 0.5:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


def assess(weather: WeatherSample, load_lbs: int) -> RiskAssessment:
    """Overall risk is the worst of wind, rain and snow."""
    wind = wind_level(weather.wind_mph, load_lbs)
    rain = rain_level(weather.rain_in_hr)
    snow = snow_level(weather.snow_in_hr)
    return RiskAssessment(
        level=max(wind, rain, snow),
        wind=wind,
        rain=rain,
        snow=snow,
        # Compare against an empty truck to tell whether the load rules kicked in.
        load_adjusted=wind != wind_level(weather.wind_mph, load_lbs=0),
    )
