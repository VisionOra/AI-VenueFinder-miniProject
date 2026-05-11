import pytest
from django.urls import reverse

from apps.venues.models import Venue


@pytest.mark.django_db
class TestVenueList:
    def test_list_returns_all_venues(self, api_client, venue_factory):
        venue_factory(city="London", capacity=100, price_per_day="1000.00")
        venue_factory(city="Manchester", capacity=200, price_per_day="2000.00")
        venue_factory(city="Edinburgh", capacity=300, price_per_day="3000.00")

        response = api_client.get("/api/venues/")
        assert response.status_code == 200
        assert response.data["count"] == 3

    def test_filter_by_city(self, api_client, venue_factory):
        venue_factory(city="London")
        venue_factory(city="London")
        venue_factory(city="Manchester")

        response = api_client.get("/api/venues/?city=london")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_filter_by_min_capacity(self, api_client, venue_factory):
        venue_factory(capacity=50, name="Small")
        venue_factory(capacity=100, name="Medium")
        venue_factory(capacity=200, name="Large")

        response = api_client.get("/api/venues/?min_capacity=100")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_filter_by_max_price(self, api_client, venue_factory):
        venue_factory(price_per_day="1000.00", name="Cheap")
        venue_factory(price_per_day="2000.00", name="Mid")
        venue_factory(price_per_day="5000.00", name="Expensive")

        response = api_client.get("/api/venues/?max_price=2000")
        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_venue_detail(self, api_client, venue):
        response = api_client.get(f"/api/venues/{venue.id}/")
        assert response.status_code == 200
        assert response.data["name"] == venue.name
        assert response.data["city"] == venue.city
        assert "amenities" in response.data

    def test_detail_404_for_nonexistent_venue(self, api_client):
        response = api_client.get("/api/venues/99999/")
        assert response.status_code == 404

    def test_pagination_structure(self, api_client, venue_factory):
        for i in range(15):
            venue_factory(name=f"Venue {i}", city="London")

        response = api_client.get("/api/venues/")
        assert response.status_code == 200
        assert "count" in response.data
        assert "next" in response.data
        assert "results" in response.data


@pytest.mark.django_db
class TestAISearchEndpoint:
    def test_search_returns_job_id(self, api_client):
        response = api_client.post("/api/venues/search/", {"query": "modern London venue for 50 people"}, format="json")
        assert response.status_code == 202
        assert "job_id" in response.data

    def test_search_poll_pending(self, api_client):
        post_resp = api_client.post("/api/venues/search/", {"query": "test"}, format="json")
        job_id = post_resp.data["job_id"]

        get_resp = api_client.get(f"/api/venues/search/{job_id}/")
        assert get_resp.status_code == 200
        assert get_resp.data["status"] in ("pending", "complete", "failed")

    def test_search_poll_unknown_job(self, api_client):
        response = api_client.get("/api/venues/search/00000000-0000-0000-0000-000000000000/")
        assert response.status_code == 404

    def test_search_requires_query_field(self, api_client):
        response = api_client.post("/api/venues/search/", {}, format="json")
        assert response.status_code == 400
