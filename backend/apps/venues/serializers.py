from rest_framework import serializers

from .models import Venue


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = [
            "id",
            "name",
            "city",
            "capacity",
            "price_per_day",
            "description",
            "amenities",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class AISearchRequestSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=500, help_text="Natural language venue search query")


class AISearchResultItemSerializer(serializers.Serializer):
    venue = VenueSerializer()
    explanation = serializers.CharField()


class AISearchJobSerializer(serializers.Serializer):
    job_id = serializers.CharField()
    status = serializers.ChoiceField(choices=["pending", "complete", "failed"])
    results = AISearchResultItemSerializer(many=True, required=False)
    error = serializers.CharField(required=False, allow_null=True)
