import django_filters

from .models import Venue


class VenueFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(lookup_expr="iexact")
    min_capacity = django_filters.NumberFilter(field_name="capacity", lookup_expr="gte")
    max_capacity = django_filters.NumberFilter(field_name="capacity", lookup_expr="lte")
    max_price = django_filters.NumberFilter(field_name="price_per_day", lookup_expr="lte")
    amenities = django_filters.BaseInFilter(field_name="amenities", lookup_expr="contains")

    class Meta:
        model = Venue
        fields = ["city", "min_capacity", "max_capacity", "max_price"]
