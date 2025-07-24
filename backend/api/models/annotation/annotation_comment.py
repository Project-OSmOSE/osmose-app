"""Annotation comment model"""

from django.conf import settings
from django.db import models

from .annotation import Annotation
from .annotation_phase import AnnotationPhase
from ..data import Spectrogram


class AnnotationComment(models.Model):
    """
    This table contains comment of annotation result and task.
    """

    comment = models.CharField(max_length=255)
    annotation = models.ForeignKey(
        Annotation,
        on_delete=models.CASCADE,
        related_name="annotation_comments",
        null=True,
        blank=True,
        default=None,
    )
    annotation_phase = models.ForeignKey(
        AnnotationPhase, on_delete=models.CASCADE, related_name="annotation_comments"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_comments",
    )
    spectrogram = models.ForeignKey(
        Spectrogram, on_delete=models.CASCADE, related_name="annotation_comments"
    )
