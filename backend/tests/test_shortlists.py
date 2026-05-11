from unittest.mock import patch

import pytest

from apps.shortlists.models import Shortlist


@pytest.mark.django_db
class TestShortlistAdd:
    def test_add_venue_to_shortlist(self, auth_client, venue):
        response = auth_client.post(f"/api/venues/{venue.id}/shortlist/")
        assert response.status_code == 201
        assert Shortlist.objects.filter(venue=venue).count() == 1

    def test_add_same_venue_twice_is_idempotent(self, auth_client, venue):
        auth_client.post(f"/api/venues/{venue.id}/shortlist/")
        response = auth_client.post(f"/api/venues/{venue.id}/shortlist/")
        assert response.status_code == 200  # 200 on duplicate, not 201
        assert Shortlist.objects.filter(venue=venue).count() == 1

    def test_add_requires_authentication(self, api_client, venue):
        response = api_client.post(f"/api/venues/{venue.id}/shortlist/")
        assert response.status_code == 401

    def test_add_nonexistent_venue_returns_404(self, auth_client):
        response = auth_client.post("/api/venues/99999/shortlist/")
        assert response.status_code == 404

    @patch("apps.shortlists.views.send_shortlist_summary.delay")
    def test_summary_task_triggered_at_threshold(self, mock_delay, auth_client, user, venue_factory):
        v1, v2, v3 = venue_factory(name="A"), venue_factory(name="B"), venue_factory(name="C")

        auth_client.post(f"/api/venues/{v1.id}/shortlist/")
        auth_client.post(f"/api/venues/{v2.id}/shortlist/")
        assert mock_delay.call_count == 0

        auth_client.post(f"/api/venues/{v3.id}/shortlist/")
        mock_delay.assert_called_once_with(user.id)

    @patch("apps.shortlists.views.send_shortlist_summary.delay")
    def test_summary_task_not_triggered_again_after_threshold(self, mock_delay, auth_client, user, venue_factory):
        venues = [venue_factory(name=f"V{i}") for i in range(5)]
        for v in venues:
            auth_client.post(f"/api/venues/{v.id}/shortlist/")

        # Should only fire once — at the 2→3 crossing
        assert mock_delay.call_count == 1


@pytest.mark.django_db
class TestShortlistRemove:
    def test_remove_venue_from_shortlist(self, auth_client, venue):
        auth_client.post(f"/api/venues/{venue.id}/shortlist/")
        response = auth_client.delete(f"/api/venues/{venue.id}/shortlist/remove/")
        assert response.status_code == 204
        assert Shortlist.objects.filter(venue=venue).count() == 0

    def test_remove_not_shortlisted_returns_404(self, auth_client, venue):
        response = auth_client.delete(f"/api/venues/{venue.id}/shortlist/remove/")
        assert response.status_code == 404

    def test_remove_requires_authentication(self, api_client, venue):
        response = api_client.delete(f"/api/venues/{venue.id}/shortlist/remove/")
        assert response.status_code == 401


@pytest.mark.django_db
class TestShortlistList:
    def test_returns_user_shortlist(self, auth_client, venue_factory, user):
        v1, v2 = venue_factory(name="X"), venue_factory(name="Y")
        auth_client.post(f"/api/venues/{v1.id}/shortlist/")
        auth_client.post(f"/api/venues/{v2.id}/shortlist/")

        response = auth_client.get("/api/shortlist/")
        assert response.status_code == 200
        # Shortlist returns a plain list (pagination disabled)
        ids = [item["venue"]["id"] for item in response.data]
        assert v1.id in ids
        assert v2.id in ids

    def test_shortlist_isolated_per_user(self, api_client, venue_factory, db):
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import RefreshToken

        User = get_user_model()
        user_a = User.objects.create_user(username="alice", password="pass1234")
        user_b = User.objects.create_user(username="bob", password="pass1234")
        v = venue_factory(name="Shared Venue")

        token_a = RefreshToken.for_user(user_a)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a.access_token}")
        api_client.post(f"/api/venues/{v.id}/shortlist/")

        token_b = RefreshToken.for_user(user_b)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_b.access_token}")
        response = api_client.get("/api/shortlist/")
        assert response.status_code == 200
        assert len(response.data) == 0  # Bob's shortlist is empty

    def test_list_requires_authentication(self, api_client):
        response = api_client.get("/api/shortlist/")
        assert response.status_code == 401
