from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Venue",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("city", models.CharField(db_index=True, max_length=100)),
                ("capacity", models.PositiveIntegerField(db_index=True)),
                ("price_per_day", models.DecimalField(db_index=True, decimal_places=2, max_digits=10)),
                ("description", models.TextField()),
                ("amenities", models.JSONField(default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="venue",
            index=models.Index(fields=["city", "capacity"], name="venues_venu_city_capa_idx"),
        ),
        migrations.AddIndex(
            model_name="venue",
            index=models.Index(fields=["city", "price_per_day"], name="venues_venu_city_pric_idx"),
        ),
    ]
