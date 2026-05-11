from django.urls import path

from .views import ShortlistListView

urlpatterns = [
    path("", ShortlistListView.as_view(), name="shortlist-list"),
]
