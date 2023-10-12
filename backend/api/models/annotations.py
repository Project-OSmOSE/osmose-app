"""Annotation-related models"""

from collections import defaultdict
from random import shuffle

from django.db import models
from django.conf import settings


class AnnotationTag(models.Model):
    """
    This table contains tags which are used to constitute annotation_sets and serve to annotate files for annotation
    campaigns.
    """

    class Meta:
        db_table = "annotation_tags"

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)


class AnnotationSet(models.Model):
    """
    This table contains collections of tags to be used for dataset annotations. An annotation_set is created by a user
    and can be used for multiple datasets and annotation campaigns.
    """

    class Meta:
        db_table = "annotation_sets"

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    tags = models.ManyToManyField(AnnotationTag)

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)


class AnnotationCampaign(models.Model):
    """
    Table containing an annotation_campaign, to be used with the table annotation_campaign_datasets. A researcher
    wanting to have a number of annotated datasets will chose a annotation_set and launch a campaign.

    For AnnotationScope RECTANGLE means annotating through boxes first, WHOLE means annotating presence/absence for the
    whole file first (boxes can be used to augment annotation).
    """

    AnnotationScope = models.IntegerChoices("AnnotationScope", "RECTANGLE WHOLE")

    class Meta:
        db_table = "annotation_campaigns"
        ordering = ["name", "created_at"]

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    instructions_url = models.TextField(null=True, blank=True)
    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    annotation_set = models.ForeignKey(AnnotationSet, on_delete=models.CASCADE)
    datasets = models.ManyToManyField("Dataset")
    spectro_configs = models.ManyToManyField(
        "SpectroConfig", related_name="annotation_campaigns"
    )
    annotation_scope = models.IntegerField(
        choices=AnnotationScope.choices, default=AnnotationScope.RECTANGLE
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    annotators = models.ManyToManyField(
        to=settings.AUTH_USER_MODEL,
        through="AnnotationTask",
        related_name="task_campaigns",
    )

    def add_annotator(self, annotator, files_target=None, method="sequential"):
        """Create a files_target number of annotation tasks assigned to annotator for a given method"""
        if method not in ["sequential", "random"]:
            raise ValueError(f'Given method argument "{method}" is not supported')
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
                if method == "random":
                    shuffle(group_files)
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


class AnnotationResult(models.Model):
    """
    This table contains the resulting tag associations for specific annotation_tasks
    """

    class Meta:
        db_table = "annotation_results"

    start_time = models.FloatField(null=True, blank=True)
    end_time = models.FloatField(null=True, blank=True)
    start_frequency = models.FloatField(null=True, blank=True)
    end_frequency = models.FloatField(null=True, blank=True)

    annotation_tag = models.ForeignKey(AnnotationTag, on_delete=models.CASCADE)
    annotation_task = models.ForeignKey(
        AnnotationTask, on_delete=models.CASCADE, related_name="results"
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
    can be multiple AA sessions for a annotation_tasks, the result of the latest session should be equal to the
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
