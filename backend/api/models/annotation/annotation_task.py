"""Annotation task model"""
from django.conf import settings
from django.db import models

from .annotation_phase import AnnotationPhase
from ..common import Session
from ..data import Spectrogram


class AnnotationTask(models.Model):
    """
    This table represents the need to annotate a specific dataset_file by a specific user in the course of an annotation
    campaign and is linked to by the resulting annotation results.
    """

    class Status(models.TextChoices):
        """Status of the annotation task. Multiple choices are offered : created, started, finished."""

        CREATED = ("C", "Created")
        FINISHED = ("F", "Finished")

    class Meta:
        ordering = ["spectrogram__start", "id"]
        unique_together = (("spectrogram", "annotation_phase", "annotator"),)

    status = models.TextField(choices=Status.choices, default=Status.CREATED)

    annotation_phase = models.ForeignKey(
        AnnotationPhase, on_delete=models.CASCADE, related_name="annotation_tasks"
    )
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_tasks",
    )
    spectrogram = models.ForeignKey(
        Spectrogram, on_delete=models.PROTECT, related_name="annotation_tasks"
    )

    sessions = models.ManyToManyField(
        Session, related_name="annotation_tasks", through="AnnotationTaskSession"
    )


class AnnotationTaskSession(models.Model):
    """Task sessions relation"""

    session = models.OneToOneField(Session, on_delete=models.CASCADE)
    annotation_task = models.ForeignKey(AnnotationTask, on_delete=models.CASCADE)
