"""Response shape for /plan.

These serializers read straight from the dataclasses in trips.domain: each
field name matches an attribute (or `source=` points at a different one).
Nested serializers produce nested JSON objects.
"""
from rest_framework import serializers

from trips.serializers.fields import RiskLevelField, RoundedFloatField


class PlaceSerializer(serializers.Serializer):
    name = serializers.CharField()
    lat = RoundedFloatField(digits=5)
    lon = RoundedFloatField(digits=5)


class WeatherSerializer(serializers.Serializer):
    temperature_f = RoundedFloatField(digits=1)
    wind_mph = RoundedFloatField(
        digits=0, help_text="Sustained wind at 10 m in whole mph, like the risk table. Used for the risk rules."
    )
    gust_mph = RoundedFloatField(digits=1, help_text="Shown for context, not used in the risk rules.")
    rain_in_hr = RoundedFloatField(digits=2, help_text="Rain and showers during the hour the truck passes, to 0.01 in.")
    snow_in_hr = RoundedFloatField(digits=1, help_text="Snowfall during the hour the truck passes, to 0.1 in.")


class RiskSerializer(serializers.Serializer):
    level = RiskLevelField(help_text="Worst of wind, rain and snow.")
    # Same value as `level`, but as a number, which is handier for coloring.
    score = serializers.IntegerField(source="level", help_text="0 = low ... 4 = no_travel")
    wind = RiskLevelField()
    rain = RiskLevelField()
    snow = RiskLevelField()
    load_adjusted = serializers.BooleanField(
        help_text="True when the load weight rules raised the wind risk above wind speed alone."
    )


class CheckpointSerializer(serializers.Serializer):
    mile = RoundedFloatField(digits=1)
    lat = RoundedFloatField(digits=5)
    lon = RoundedFloatField(digits=5)
    eta = serializers.DateTimeField()
    # allow_null: these come out as null when the forecast doesn't reach the ETA.
    weather = WeatherSerializer(allow_null=True, help_text="Null when the forecast doesn't reach this ETA.")
    risk = RiskSerializer(allow_null=True)


class MilesByLevelSerializer(serializers.Serializer):
    low = RoundedFloatField(digits=1)
    moderate = RoundedFloatField(digits=1)
    high = RoundedFloatField(digits=1)
    severe = RoundedFloatField(digits=1)
    no_travel = RoundedFloatField(digits=1)


class RiskSummarySerializer(serializers.Serializer):
    worst_level = RiskLevelField()
    average_score = RoundedFloatField(digits=2, help_text="Distance-weighted, 0 (low) to 4 (no travel).")
    # The dataclass keys this dict by RiskLevel; miles_by_label has string keys for JSON.
    miles_by_level = MilesByLevelSerializer(source="miles_by_label")
    unknown_miles = RoundedFloatField(digits=1)


class RouteSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    summary = serializers.CharField(help_text="Main roads on the route, e.g. 'I 35, I 44'.")
    distance_miles = RoundedFloatField(digits=1)
    duration_minutes = RoundedFloatField(digits=0)
    arrival_time = serializers.DateTimeField()
    is_recommended = serializers.BooleanField()
    risk = RiskSummarySerializer()
    geometry = serializers.ListField(
        child=serializers.ListField(child=serializers.FloatField(), min_length=2, max_length=2),
        help_text="Simplified route line as [lat, lon] pairs.",
    )
    # many=True: a list of checkpoints, each shaped by CheckpointSerializer.
    checkpoints = CheckpointSerializer(many=True)


# Top-level response object.
class TripPlanSerializer(serializers.Serializer):
    origin = PlaceSerializer()
    destination = PlaceSerializer()
    departure_time = serializers.DateTimeField()
    load_weight_lbs = serializers.IntegerField()
    sample_interval_miles = serializers.IntegerField()
    recommended_route_id = serializers.IntegerField()
    recommendation = serializers.CharField(help_text="Why the recommended route won.")
    warnings = serializers.ListField(child=serializers.CharField())
    routes = RouteSerializer(many=True)
