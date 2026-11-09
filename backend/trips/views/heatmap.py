from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from trips.serializers import HeatmapSerializer, TripRequestSerializer
from trips.services.heatmap import build_heatmap
from trips.views.examples import DALLAS_TO_CHICAGO, DENVER_TO_SALT_LAKE


# POST /api/trips/heatmap/ returns 49 hourly weather frames for the map slider.
class TripHeatmapView(APIView):
    throttle_scope = "trips"

    @extend_schema(
        summary="Weather heatmap for the trip corridor",
        description=(
            "Hourly weather and risk on a grid around all candidate routes, for "
            "49 hours starting at the departure hour (slider positions 0-48). "
            "Takes the same body as the plan endpoint; sample_interval_miles is ignored."
        ),
        tags=["trips"],
        request=TripRequestSerializer,
        responses={
            200: HeatmapSerializer,
            400: OpenApiResponse(description="Invalid input or a location that couldn't be found."),
            422: OpenApiResponse(description="No drivable route between the two locations."),
            502: OpenApiResponse(description="Routing or weather provider failed."),
        },
        examples=[DALLAS_TO_CHICAGO, DENVER_TO_SALT_LAKE],
    )
    def post(self, request):
        # Same body as /plan; fields this serializer doesn't know (the interval) are ignored.
        params = TripRequestSerializer(data=request.data)
        params.is_valid(raise_exception=True)

        heatmap = build_heatmap(**params.validated_data)
        return Response(HeatmapSerializer(heatmap).data)
