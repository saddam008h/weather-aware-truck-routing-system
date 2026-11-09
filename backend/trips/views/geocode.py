from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from trips.serializers import GeocodeQuerySerializer, PlaceSerializer
from trips.services import locations


# GET /api/geocode/?q=... feeds the autocomplete in the origin/destination inputs.
class GeocodeView(APIView):
    # Rate limit bucket, see DEFAULT_THROTTLE_RATES in settings.
    throttle_scope = "geocode"

    @extend_schema(
        summary="Search places",
        description="Place suggestions for the origin/destination inputs.",
        tags=["locations"],
        parameters=[GeocodeQuerySerializer],
        responses={
            200: PlaceSerializer(many=True),
            400: OpenApiResponse(description="Missing or too short query."),
            502: OpenApiResponse(description="Geocoding provider failed."),
        },
    )
    def get(self, request):
        # raise_exception=True sends a 400 with the field errors if validation fails.
        query = GeocodeQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)

        places = locations.search(query.validated_data["q"])
        return Response(PlaceSerializer(places, many=True).data)
