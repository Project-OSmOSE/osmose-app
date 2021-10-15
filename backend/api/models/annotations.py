"""Annotation-related models"""

from collections import defaultdict
from random import shuffle

from django.db import models
from django.contrib.auth.models import User

class AnnotationTag(models.Model):
    class Meta:
        db_table = 'annotation_tags'

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)


class AnnotationSet(models.Model):
    class Meta:
        db_table = 'annotation_sets'

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True)
    tags = models.ManyToManyField(AnnotationTag)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class AnnotationCampaign(models.Model):
    class Meta:
        db_table = 'annotation_campaigns'

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField()
    instructions_url = models.TextField()
    start = models.DateTimeField()
    end = models.DateTimeField()

    annotation_set = models.ForeignKey(AnnotationSet, on_delete=models.CASCADE)
    datasets = models.ManyToManyField('Dataset')
    spectro_configs = models.ManyToManyField('SpectroConfig', related_name='annotation_campaigns')
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def add_annotator(self, annotator, files_target=None, method='sequential'):
        if method not in ['sequential', 'random']:
            raise ValueError(f'Given method argument "{method}" is not supported')
        dataset_files = self.datasets.values_list('files__id', flat=True)
        if files_target > len(dataset_files):
            raise ValueError(f'Cannot annotate {files_target} files, not enough files')
        if files_target:
            # First let's group dataset_files by annotator_count
            file_groups = defaultdict(list)
            files_annotator_count = self.tasks.values_list('dataset_file_id').annotate(models.Count('annotator_id'))
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
                if method == 'random':
                    shuffle(group_files)
                dataset_files += group_files[:files_target]
                if len(dataset_files) >= files_target:
                    break
                files_target -= len(dataset_files)
        AnnotationTask.objects.bulk_create([
            AnnotationTask(
                status=0,
                annotator_id=annotator.id,
                dataset_file_id=dataset_file_id,
                annotation_campaign_id=self.id
            ) for dataset_file_id in dataset_files
        ])


class AnnotationTask(models.Model):
    class Meta:
        db_table = 'annotation_tasks'

    status = models.IntegerField()

    annotation_campaign = models.ForeignKey(AnnotationCampaign, on_delete=models.CASCADE, related_name='tasks')
    annotator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='annotation_tasks')
    dataset_file = models.ForeignKey('DatasetFile', on_delete=models.CASCADE, related_name='annotation_tasks')


class AnnotationResult(models.Model):
    class Meta:
        db_table = 'annotation_results'

    start_time = models.FloatField(null=True, blank=True)
    end_time = models.FloatField(null=True, blank=True)
    start_frequency = models.FloatField(null=True, blank=True)
    end_frequency = models.FloatField(null=True, blank=True)

    annotation_tag = models.ForeignKey(AnnotationTag, on_delete=models.CASCADE)
    annotation_task = models.ForeignKey(AnnotationTask, on_delete=models.CASCADE, related_name='results')


class AnnotationSession(models.Model):
    class Meta:
        db_table = 'annotation_sessions'

    start = models.DateTimeField()
    end = models.DateTimeField()
    session_output = models.JSONField()

    annotation_task = models.ForeignKey(AnnotationTask, on_delete=models.CASCADE, related_name='sessions')
