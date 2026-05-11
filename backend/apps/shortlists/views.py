from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.venues.models import Venue

from .models import Shortlist
from .serializers import ShortlistSerializer
from .tasks import send_shortlist_summary

SHORTLIST_SUMMARY_THRESHOLD = 3


class ShortlistListView(generics.ListAPIView):
    serializer_class = ShortlistSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    @extend_schema(summary="Get authenticated user's shortlist")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        # Guard for drf-spectacular schema generation — it calls get_queryset
        # with a fake anonymous request, which breaks the user FK filter.
        if getattr(self, "swagger_fake_view", False):
            return Shortlist.objects.none()
        return Shortlist.objects.filter(user=self.request.user).select_related("venue")


class ShortlistAddView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Add a venue to the user's shortlist",
        request=None,
        responses={
            201: ShortlistSerializer,
            200: ShortlistSerializer,
            404: OpenApiResponse(description="Venue not found"),
        },
    )
    def post(self, request, venue_id):
        try:
            venue = Venue.objects.get(pk=venue_id)
        except Venue.DoesNotExist:
            return Response({"detail": "Venue not found."}, status=status.HTTP_404_NOT_FOUND)

        count_before = Shortlist.objects.filter(user=request.user).count()
        entry, created = Shortlist.objects.get_or_create(user=request.user, venue=venue)

        if created:
            count_after = count_before + 1
            if count_before < SHORTLIST_SUMMARY_THRESHOLD <= count_after:
                send_shortlist_summary.delay(request.user.id)

        http_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(ShortlistSerializer(entry).data, status=http_status)


class ShortlistRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Remove a venue from the user's shortlist",
        request=None,
        responses={
            204: OpenApiResponse(description="Removed"),
            404: OpenApiResponse(description="Not in shortlist"),
        },
    )
    def delete(self, request, venue_id):
        deleted, _ = Shortlist.objects.filter(user=request.user, venue_id=venue_id).delete()
        if not deleted:
            return Response({"detail": "Venue not in shortlist."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
