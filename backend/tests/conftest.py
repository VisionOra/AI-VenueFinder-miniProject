import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.venues.models import Venue

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", password="testpass123")


@pytest.fixture
def auth_client(api_client, user):
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def venue(db):
    return Venue.objects.create(
        name="Test Venue",
        city="London",
        capacity=100,
        price_per_day="2000.00",
        description="A great test venue in London.",
        amenities=["wifi", "av", "catering"],
    )


@pytest.fixture
def venue_factory(db):
    def _make(**kwargs):
        defaults = {
            "name": "Factory Venue",
            "city": "Manchester",
            "capacity": 50,
            "price_per_day": "1500.00",
            "description": "A venue created by the factory.",
            "amenities": ["wifi"],
        }
        defaults.update(kwargs)
        return Venue.objects.create(**defaults)

    return _make
