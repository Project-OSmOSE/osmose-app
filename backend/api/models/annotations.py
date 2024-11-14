"""Annotation-related models"""
from django.conf import settings
from django.db import models
from django.db.models.query import QuerySet
from django.utils import timezone

from backend.aplose.models import User
from .annotation import (
    AnnotationResult,
    AnnotationTask,
    LabelSet,
    ConfidenceIndicatorSet,
)
from .datasets import DatasetFile


class AnnotationCampaignUsage(models.IntegerChoices):
    """Annotation campaign usage"""

    CREATE = (
        0,
        "Create",
    )
    CHECK = (
        1,
        "Check",
    )


class AnnotationCampaignArchive(models.Model):
    """AnnotationCampaign archive information"""

    date = models.DateTimeField(auto_now_add=True)
    by_user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        related_name="archived_campaigns",
        on_delete=models.SET_NULL,
        null=True,
    )

    def __str__(self):
        return str(self.date) + " | " + str(self.by_user)


class AnnotationCampaign(models.Model):
    """
    Table containing an annotation_campaign, to be used with the table annotation_campaign_datasets. A researcher
    wanting to have a number of annotated datasets will choose an label_set and launch a campaign.

    For AnnotationScope RECTANGLE means annotating through boxes first, WHOLE means annotating presence/absence for the
    whole file first (boxes can be used to augment annotation).
    """

    AnnotationScope = models.IntegerChoices("AnnotationScope", "RECTANGLE WHOLE")

    class Meta:
        db_table = "annotation_campaigns"
        ordering = ["name"]

    def __str__(self):
        return str(self.name)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    instructions_url = models.TextField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)

    label_set = models.ForeignKey(LabelSet, on_delete=models.CASCADE)
    datasets = models.ManyToManyField("Dataset", related_name="annotation_campaigns")
    spectro_configs = models.ManyToManyField(
        "SpectrogramConfiguration", related_name="annotation_campaigns"
    )
    annotation_scope = models.IntegerField(
        choices=AnnotationScope.choices, default=AnnotationScope.WHOLE
    )
    usage = models.IntegerField(
        choices=AnnotationCampaignUsage.choices, default=AnnotationCampaignUsage.CREATE
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    annotators = models.ManyToManyField(
        to=settings.AUTH_USER_MODEL,
        through="AnnotationFileRange",
        related_name="campaigns",
    )
    confidence_indicator_set = models.ForeignKey(
        ConfidenceIndicatorSet, on_delete=models.SET_NULL, null=True, blank=True
    )
    archive = models.OneToOneField(
        AnnotationCampaignArchive,
        related_name="campaign",
        on_delete=models.SET_NULL,
        null=True,
    )

    def do_archive(self, user: User):
        """Archive current campaign"""
        if self.archive is not None:
            return
        self.archive = AnnotationCampaignArchive.objects.create(by_user=user)
        self.save()

    def get_sorted_files(self) -> QuerySet[DatasetFile]:
        """Return sorted dataset files"""
        return DatasetFile.objects.filter(
            dataset_id__in=self.datasets.values_list("id", flat=True)
        ).order_by("start", "id")


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
