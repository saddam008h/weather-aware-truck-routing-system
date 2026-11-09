from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView


# For uptime checks from the hosting provider.
class HealthView(APIView):
    @extend_schema(
        summary="Health check",
        tags=["meta"],
        responses=inline_serializer("Health", {"status": serializers.CharField()}),
    )
    def get(self, request):
        return Response({"status": "ok"})
