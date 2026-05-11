from django.db import models


class Venue(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    capacity = models.PositiveIntegerField(db_index=True)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    description = models.TextField()
    # Stored as a list of strings, e.g. ["wifi", "parking", "catering", "av", "breakout_rooms"]
    amenities = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["city", "capacity"]),
            models.Index(fields=["city", "price_per_day"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.city})"
