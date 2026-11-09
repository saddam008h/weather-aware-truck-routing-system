from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from trips.serializers import PlanRequestSerializer, TripPlanSerializer
from trips.services.trip_planner import plan_trip
from trips.views.examples import DALLAS_TO_CHICAGO, DENVER_TO_SALT_LAKE


# POST /api/trips/plan/ is the main endpoint: routes, checkpoints, risk and the recommendation.
class TripPlanView(APIView):
    throttle_scope = "trips"

    @extend_schema(
        summary="Plan a trip",
        description=(
            "Finds up to three routes, samples the forecast at checkpoints every "
            "10/25/50 miles for the time the truck reaches each one, scores the "
            "weather risk with the load weight rules and recommends a route."
        ),
        tags=["trips"],
        request=PlanRequestSerializer,
        responses={
            200: TripPlanSerializer,
            400: OpenApiResponse(description="Invalid input or a location that couldn't be found."),
            422: OpenApiResponse(description="No drivable route between the two locations."),
            502: OpenApiResponse(description="Routing or weather provider failed."),
        },
        examples=[DALLAS_TO_CHICAGO, DENVER_TO_SALT_LAKE],
    )
    def post(self, request):
        params = PlanRequestSerializer(data=request.data)
        params.is_valid(raise_exception=True)

        # validated_data's keys match plan_trip's arguments one to one.
        # Errors raised inside (no route, provider down, ...) become JSON responses
        # automatically, see trips/exceptions.py.
        plan = plan_trip(**params.validated_data)
        return Response(TripPlanSerializer(plan).data)
