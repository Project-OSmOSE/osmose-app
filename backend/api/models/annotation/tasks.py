"""Annotation task related models"""

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import QuerySet

from backend.api.models.datasets import DatasetFile


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
        unique_together = (("dataset_file", "annotation_campaign", "annotator"),)

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


class AnnotationFileRange(models.Model):
    """Gives a range of files to annotate by an annotator within a campaign"""

    class Meta:
        ordering = ["first_file_index"]
        unique_together = (
            (
                "first_file_index",
                "last_file_index",
                "annotation_campaign",
                "annotator",
            ),
        )

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

    def get_files(self) -> QuerySet[DatasetFile]:
        """Return files corresponding to this range"""
        # pylint: disable=no-member
        campaign_files: QuerySet[
            DatasetFile
        ] = self.annotation_campaign.get_sorted_files()
        return campaign_files[self.first_file_index : self.last_file_index + 1]

    def get_tasks(self) -> QuerySet[AnnotationTask]:
        """Return tasks corresponding to this range"""
        return self.annotation_campaign.tasks.filter(
            annotator=self.annotator,
            dataset_file_id__in=self.get_files().values_list("id", flat=True),
        )

    @property
    def finished_count(self) -> int:
        """Count finished tasks within this file range"""
        return self.get_tasks().filter(status=AnnotationTask.Status.FINISHED).count()
