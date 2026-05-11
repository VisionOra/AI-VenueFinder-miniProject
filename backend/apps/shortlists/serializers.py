from rest_framework import serializers

from apps.venues.serializers import VenueSerializer

from .models import Shortlist


class ShortlistSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)

    class Meta:
        model = Shortlist
        fields = ["id", "venue", "created_at"]
        read_only_fields = ["id", "created_at"]
