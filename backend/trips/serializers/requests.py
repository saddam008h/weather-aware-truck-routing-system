"""Request bodies and query params. Bad input never reaches the services."""
from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

MAX_DAYS_AHEAD = 7
SAMPLE_INTERVALS = (10, 25, 50)
LOCATION_HELP = 'Address, place name, or "lat,lon".'


# Shared by /plan and /heatmap. help_text shows up in Swagger.
class TripRequestSerializer(serializers.Serializer):
    origin = serializers.CharField(max_length=200, help_text=LOCATION_HELP)
    destination = serializers.CharField(max_length=200, help_text=LOCATION_HELP)
    departure_time = serializers.DateTimeField(
        default=timezone.now,
        help_text="ISO 8601 with a UTC offset. Defaults to now. Values without an offset are read as UTC.",
    )
    load_weight_lbs = serializers.IntegerField(min_value=0, max_value=80_000)

    # DRF calls validate_<field_name>() automatically after the basic type checks.
    def validate_departure_time(self, value):
        now = timezone.now()
        # An hour of slack so "leaving now" from a slightly slow clock still works.
        if value < now - timedelta(hours=1):
            raise serializers.ValidationError("Departure time is in the past.")
        if value > now + timedelta(days=MAX_DAYS_AHEAD):
            raise serializers.ValidationError(
                f"Forecasts only reach {MAX_DAYS_AHEAD} days ahead, pick an earlier departure."
            )
        return value


# /plan takes everything above plus the sampling interval.
class PlanRequestSerializer(TripRequestSerializer):
    sample_interval_miles = serializers.ChoiceField(
        choices=SAMPLE_INTERVALS,
        default=25,
        help_text="How often to sample the weather along each route.",
    )


# ?q=... for the place search box.
class GeocodeQuerySerializer(serializers.Serializer):
    q = serializers.CharField(min_length=2, max_length=200, help_text="Search text, e.g. 'Dallas, TX'.")
