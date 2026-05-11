from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.shortlists.views import ShortlistAddView, ShortlistRemoveView

from .views import AISearchPollView, AISearchStartView, VenueViewSet

router = DefaultRouter()
router.register(r"", VenueViewSet, basename="venue")

urlpatterns = [
    # AI search (before router to avoid ambiguity with <pk> patterns)
    path("search/", AISearchStartView.as_view(), name="venue-search-start"),
    path("search/<str:job_id>/", AISearchPollView.as_view(), name="venue-search-poll"),
    # Shortlist actions scoped to a specific venue
    path("<int:venue_id>/shortlist/", ShortlistAddView.as_view(), name="venue-shortlist-add"),
    path("<int:venue_id>/shortlist/remove/", ShortlistRemoveView.as_view(), name="venue-shortlist-remove"),
    # Venue CRUD (read-only)
    path("", include(router.urls)),
]
