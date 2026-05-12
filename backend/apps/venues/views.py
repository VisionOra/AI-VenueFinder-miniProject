import uuid

from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import VenueFilter
from .models import Venue
from .serializers import AISearchJobSerializer, AISearchRequestSerializer, VenueSerializer
from .tasks import get_job_state, run_ai_venue_search, set_job_state


@extend_schema_view(
    list=extend_schema(
        summary="List venues",
        parameters=[
            OpenApiParameter("city", str, description="Filter by city (case-insensitive)"),
            OpenApiParameter("min_capacity", int, description="Minimum capacity"),
            OpenApiParameter("max_capacity", int, description="Maximum capacity"),
            OpenApiParameter("max_price", float, description="Maximum price per day"),
            OpenApiParameter("page", int, description="Page number"),
        ],
    ),
    retrieve=extend_schema(summary="Get venue detail"),
    create=extend_schema(summary="Create a venue (authenticated)"),
)
class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    filterset_class = VenueFilter
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering_fields = ["price_per_day", "capacity", "created_at"]
    http_method_names = ["get", "post", "head", "options"]


class AISearchStartView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Start AI semantic search (async)",
        request=AISearchRequestSerializer,
        responses={
            202: OpenApiResponse(
                description="Job accepted",
                response={"type": "object", "properties": {"job_id": {"type": "string", "format": "uuid"}}},
            ),
            400: OpenApiResponse(description="Invalid request"),
        },
    )
    def post(self, request):
        """Kicks off an async Celery task and returns a job_id (202 Accepted)."""
        serializer = AISearchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        query = serializer.validated_data["query"]
        job_id = str(uuid.uuid4())

        # Initialise in cache before dispatching to avoid a 404 race window.
        set_job_state(job_id, {"status": "pending"})
        run_ai_venue_search.delay(job_id, query)

        return Response({"job_id": job_id}, status=status.HTTP_202_ACCEPTED)


class AISearchPollView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Poll AI search job status",
        responses={
            200: AISearchJobSerializer,
            404: OpenApiResponse(description="Job not found or expired"),
        },
    )
    def get(self, request, job_id):
        """Returns current job status and results when complete."""
        state = get_job_state(job_id)
        if state is None:
            return Response(
                {"detail": "Job not found or has expired."},
                status=status.HTTP_404_NOT_FOUND,
            )

        payload = {"job_id": job_id, "status": state["status"]}
        if state["status"] == "complete":
            payload["results"] = state.get("results", [])
        elif state["status"] == "failed":
            payload["error"] = state.get("error", "Unknown error")

        return Response(payload, status=status.HTTP_200_OK)
