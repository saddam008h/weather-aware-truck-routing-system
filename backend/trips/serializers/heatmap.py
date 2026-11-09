"""Response shape for /heatmap.

Laid out as one list of points plus parallel value lists per hour, rather than
an object per point, because it's much smaller and it's exactly what a map
heatmap layer wants when the slider moves.
"""
from rest_framework import serializers


class HeatmapFrameSerializer(serializers.Serializer):
    hour = serializers.IntegerField(help_text="Hours after start_time (0-48).")
    time = serializers.DateTimeField()
    risk = serializers.ListField(
        child=serializers.IntegerField(allow_null=True),
        help_text="Risk score (0-4) per point, same order as `points`. Null where there's no forecast.",
    )
    wind_mph = serializers.ListField(child=serializers.FloatField(allow_null=True))
    rain_in_hr = serializers.ListField(child=serializers.FloatField(allow_null=True))
    snow_in_hr = serializers.ListField(child=serializers.FloatField(allow_null=True))


class HeatmapSerializer(serializers.Serializer):
    start_time = serializers.DateTimeField(help_text="Departure time rounded down to the hour.")
    points = serializers.ListField(
        child=serializers.ListField(child=serializers.FloatField(), min_length=2, max_length=2),
        help_text="Grid points along the trip corridor as [lat, lon] pairs.",
    )
    frames = HeatmapFrameSerializer(many=True)
