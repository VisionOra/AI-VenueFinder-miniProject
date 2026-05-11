from django.contrib import admin

from .models import Shortlist


@admin.register(Shortlist)
class ShortlistAdmin(admin.ModelAdmin):
    list_display = ["user", "venue", "created_at"]
    list_filter = ["user"]
    raw_id_fields = ["venue"]
