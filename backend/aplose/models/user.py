"""User-related models"""
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class ExpertiseLevel(models.TextChoices):
    """Expertise level of the user. Multiple choices are offered : expert, average, novice."""

    EXPERT = ("E", "Expert")
    AVERAGE = ("A", "Average")
    NOVICE = ("N", "Novice")


class AploseUser(models.Model):
    """Override of default Django User model"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="aplose")

    expertise_level = models.TextField(
        choices=ExpertiseLevel.choices,
        blank=True,
        null=True,
        default=ExpertiseLevel.NOVICE,
        help_text="Expertise level of the user.",
    )


class AnnotatorGroup(models.Model):
    """Used to manage group of annotators in APLOSE"""

    name = models.CharField(unique=True, max_length=255)

    annotators = models.ManyToManyField(User, related_name="annotator_groups")
