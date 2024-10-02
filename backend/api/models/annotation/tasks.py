"""Annotation task related models"""
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class AnnotationFileRange(models.Model):
    """Gives a range of files to annotate by an annotator within a campaign"""

    class Meta:
        ordering = ["first_file_index"]

    first_file_index = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    last_file_index = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_file_ranges",
    )
    annotation_campaign = models.ForeignKey(
        "AnnotationCampaign",
        on_delete=models.CASCADE,
        related_name="annotation_file_ranges",
    )


class AnnotationTask(models.Model):
    """
    This table represents the need to annotate a specific dataset_file by a specific user in the course of an annotation
    campaign and is linked to by the resulting annotation results.
    """

    class Status(models.TextChoices):
        """Status of the annotation task. Multiple choices are offered : created, started, finished."""

        CREATED = ("C", "Created")
        STARTED = ("S", "Started")
        FINISHED = ("F", "Finished")

    class Meta:
        ordering = ["dataset_file__start", "id"]

    status = models.TextField(choices=Status.choices, default=Status.CREATED)

    annotation_campaign = models.ForeignKey(
        "AnnotationCampaign", on_delete=models.CASCADE, related_name="tasks"
    )
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_tasks",
    )
    dataset_file = models.ForeignKey(
        "DatasetFile", on_delete=models.CASCADE, related_name="annotation_tasks"
    )
