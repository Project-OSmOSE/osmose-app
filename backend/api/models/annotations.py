"""Annotation-related models"""

from collections import defaultdict

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

from backend.aplose_auth.models import User
from .annotation import AnnotationResult


class ConfidenceIndicatorSet(models.Model):
    """
    This table contains collections of confidence indicator to be used for annotation campaign.
    A confidence indicator set is created by a staff user.
    """

    class Meta:
        db_table = "confidence_sets"

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)

    @property
    def max_level(self):
        """Give the max level among confidence indicators"""
        return max(i.level for i in self.confidence_indicators.all())


class ConfidenceIndicator(models.Model):
    """
    This table contains confidence indicator in which are used to constitute confidence indicator set and serve
    to annotate files for annotation campaign.
    """

    class Meta:
        db_table = "confidence_indicator"
        constraints = [
            models.UniqueConstraint(
                name="one_default_by_confidence_indicator_set",
                fields=["is_default", "confidence_indicator_set"],
                condition=Q(is_default=True),
            ),
        ]
        unique_together = ("confidence_indicator_set", "label")

    def __str__(self):
        return str(self.label)

    label = models.CharField(max_length=255)
    level = models.IntegerField()
    confidence_indicator_set = models.ForeignKey(
        ConfidenceIndicatorSet,
        verbose_name="Included in this set :",
        on_delete=models.CASCADE,
        related_name="confidence_indicators",
    )
    is_default = models.BooleanField(default=False)


class Label(models.Model):
    """
    This table contains labels which are used to constitute label_set and serve to annotate files for annotation
    campaigns.
    """

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)


class LabelSet(models.Model):
    """
    This table contains collections of labels to be used for dataset annotations.
    An label_set is created by a staff user
    and can be used for multiple datasets and annotation campaigns.
    """

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    labels = models.ManyToManyField(Label)


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
    deadline = models.DateTimeField(null=True, blank=True)

    label_set = models.ForeignKey(LabelSet, on_delete=models.CASCADE)
    datasets = models.ManyToManyField("Dataset")
    spectro_configs = models.ManyToManyField(
        "SpectrogramConfiguration", related_name="annotation_campaigns"
    )
    annotation_scope = models.IntegerField(
        choices=AnnotationScope.choices, default=AnnotationScope.RECTANGLE
    )
    usage = models.IntegerField(
        choices=AnnotationCampaignUsage.choices, default=AnnotationCampaignUsage.CREATE
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    annotators = models.ManyToManyField(
        to=settings.AUTH_USER_MODEL,
        through="AnnotationTask",
        related_name="task_campaigns",
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

    def add_annotator(self, annotator, files_target=None):
        """Create a files_target number of annotation tasks assigned to annotator"""
        dataset_files = self.datasets.values_list("files__id", flat=True)
        if files_target > len(dataset_files):
            raise ValueError(f"Cannot annotate {files_target} files, not enough files")
        if files_target:
            # First let's group dataset_files by annotator_count
            file_groups = defaultdict(list)
            files_annotator_count = self.tasks.values_list("dataset_file_id").annotate(
                models.Count("annotator_id")
            )
            for file_id, annotator_count in files_annotator_count:
                file_groups[annotator_count].append(file_id)
            remaining = set(dataset_files)
            for files in file_groups.values():
                remaining -= set(files)
            file_groups[0] = list(remaining)
            # Second we reset dataset_files and fill it from lower annotator count groups first
            dataset_files = []
            for key in sorted(file_groups.keys()):
                group_files = file_groups[key]
                dataset_files += group_files[:files_target]
                if len(dataset_files) >= files_target:
                    break
                files_target -= len(dataset_files)
        AnnotationTask.objects.bulk_create(
            [
                AnnotationTask(
                    status=0,
                    annotator_id=annotator.id,
                    dataset_file_id=dataset_file_id,
                    annotation_campaign_id=self.id,
                )
                for dataset_file_id in dataset_files
            ]
        )

    def do_archive(self, user: User):
        """Archive current campaign"""
        if self.archive is not None:
            return
        self.archive = AnnotationCampaignArchive.objects.create(by_user=user)
        self.save()


class AnnotationTask(models.Model):
    """
    This table represents the need to annotate a specific dataset_file by a specific user in the course of an annotation
    campaign and is linked to by the resulting annotation results.
    """

    StatusChoices = models.IntegerChoices(
        "StatusChoices", "CREATED STARTED FINISHED", start=0
    )

    class Meta:
        db_table = "annotation_tasks"
        ordering = ["dataset_file__audio_metadatum__start"]

    status = models.IntegerField(
        choices=StatusChoices.choices, default=StatusChoices.CREATED
    )

    annotation_campaign = models.ForeignKey(
        AnnotationCampaign, on_delete=models.CASCADE, related_name="tasks"
    )
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_tasks",
    )
    dataset_file = models.ForeignKey(
        "DatasetFile", on_delete=models.CASCADE, related_name="annotation_tasks"
    )


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
        related_name="result_comments",
        null=True,
        blank=True,
        default=None,
    )
    annotation_task = models.ForeignKey(
        AnnotationTask,
        on_delete=models.CASCADE,
        related_name="task_comments",
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
