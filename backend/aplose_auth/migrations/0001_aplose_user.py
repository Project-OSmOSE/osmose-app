# Generated by Django 3.2.25 on 2024-08-21 12:24

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AploseUser",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "expertise_level",
                    models.TextField(
                        blank=True,
                        choices=[("E", "Expert"), ("A", "Average"), ("N", "Novice")],
                        default="N",
                        help_text="Expertise level of the user.",
                        null=True,
                    ),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="aplose",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
