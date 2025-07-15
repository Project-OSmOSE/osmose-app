"""Annotation validation model"""
from django.conf import settings
from django.db import models

from .annotation import Annotation


class AnnotationValidation(models.Model):
    """
    This table contains the resulting label associations for specific annotation_tasks
    """

    class Meta:
        unique_together = ("annotation", "annotator")

    annotation = models.ForeignKey(
        Annotation,
        on_delete=models.CASCADE,
        related_name="validations",
    )
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_results_validation",
    )
    is_valid = models.BooleanField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    last_updated_at = models.DateTimeField(auto_now=True)
