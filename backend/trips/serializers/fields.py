"""Custom serializer fields shared by the response serializers."""
from rest_framework import serializers

from trips.domain import RiskLevel

RISK_LEVEL_CHOICES = [level.label for level in RiskLevel]


class RoundedFloatField(serializers.FloatField):
    """A float that's rounded on the way out, so the JSON isn't full of 15-digit numbers."""

    def __init__(self, digits: int = 2, **kwargs):
        self.digits = digits
        # These fields only ever appear in responses.
        kwargs.setdefault("read_only", True)
        super().__init__(**kwargs)

    def to_representation(self, value):
        return round(float(value), self.digits)


class RiskLevelField(serializers.ChoiceField):
    """Outputs a RiskLevel as its name ("low", "moderate", ... "no_travel")."""

    def __init__(self, **kwargs):
        kwargs.setdefault("read_only", True)
        # Passing the choices lets Swagger list the possible values.
        super().__init__(choices=RISK_LEVEL_CHOICES, **kwargs)

    def to_representation(self, value):
        return RiskLevel(value).label
