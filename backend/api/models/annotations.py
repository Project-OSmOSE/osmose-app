"""Annotation-related models"""
from django.conf import settings
from django.db import models

from .annotation import (
    AnnotationResult,
    AnnotationTask,
    AnnotationCampaign,
)
from .datasets import DatasetFile


class AnnotationComment(models.Model):
    """
    This table contains comment of annotation result and task.
    """

    class Meta:
        db_table = "annotation_comment"

    comment = models.CharField(max_length=255)
    annotation_result = models.ForeignKey(
        AnnotationResult,
        on_delete=models.CASCADE,
        related_name="comments",
        null=True,
        blank=True,
        default=None,
    )
    annotation_campaign = models.ForeignKey(
        AnnotationCampaign, on_delete=models.CASCADE, related_name="comments"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments"
    )
    dataset_file = models.ForeignKey(
        DatasetFile, on_delete=models.CASCADE, related_name="comments"
    )


class AnnotationSession(models.Model):
    """
    This table contains the AudioAnnotator sessions output linked to the annotation of a specific dataset file. There
    can be multiple AA sessions for an annotation_tasks, the result of the latest session should be equal to the
    dataset’s file annotation.
    """

    class Meta:
        db_table = "annotation_sessions"

    start = models.DateTimeField()
    end = models.DateTimeField()
    session_output = models.JSONField()

    annotation_task = models.ForeignKey(
        AnnotationTask, on_delete=models.CASCADE, related_name="sessions"
    )
