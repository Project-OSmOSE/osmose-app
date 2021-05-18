from collections import defaultdict
from random import shuffle
from math import log

from django.db import models
from django.contrib.auth.models import User

# TODO add POSTGIS types
# TODO create models folders and split this into multiple files

class AnnotationTag(models.Model):
    class Meta:
        db_table = 'annotation_tags'

    name = models.CharField(max_length=255)


class AudioMetadatum(models.Model):
    class Meta:
        db_table = 'audio_metadata'

    start = models.DateTimeField(null=True)
    end = models.DateTimeField(null=True)
    num_channels = models.IntegerField(null=True)
    sample_rate_khz = models.FloatField(null=True)
    total_samples = models.IntegerField(null=True)
    sample_bits = models.IntegerField(null=True)
    gain_db = models.FloatField(null=True)
    gain_rel = models.FloatField(null=True)
    dutycycle_rdm = models.FloatField(null=True)
    dutycycle_rim = models.FloatField(null=True)


class DatasetType(models.Model):
    class Meta:
        db_table = 'dataset_types'

    name = models.CharField(max_length=255)
    desc = models.TextField()


class GeoMetadatum(models.Model):
    class Meta:
        db_table = 'geo_metadata'

    name = models.CharField(max_length=255)
    desc = models.TextField()
    location = models.TextField()
    region = models.TextField()


class Job(models.Model):
    class Meta:
        db_table = 'jobs'

    to_execute = models.TextField()
    locked_at = models.DateTimeField()
    locked_by = models.CharField(max_length=255)
    status = models.IntegerField()
    result = models.TextField()
    queue = models.CharField(max_length=255)


class TabularMetadatum(models.Model):
    class Meta:
        db_table = 'tabular_metadata'

    name = models.CharField(max_length=255)
    desc = models.TextField()
    dimension_count = models.IntegerField()
    variable_count = models.IntegerField()


class AnnotationSet(models.Model):
    class Meta:
        db_table = 'annotation_sets'

    name = models.CharField(max_length=255)
    desc = models.TextField(null=True)
    tags = models.ManyToManyField(AnnotationTag)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class Collection(models.Model):
    class Meta:
        db_table = 'collections'

    name = models.CharField(max_length=255)
    desc = models.TextField(null=True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class Dataset(models.Model):
    class Meta:
        db_table = 'datasets'

    name = models.CharField(max_length=255)
    desc = models.TextField(null=True)
    dataset_path = models.CharField(max_length=255)
    status = models.IntegerField()
    files_type = models.CharField(max_length=255)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)

    audio_metadatum = models.ForeignKey(AudioMetadatum, on_delete=models.CASCADE, null=True)
    dataset_type = models.ForeignKey(DatasetType, on_delete=models.CASCADE)
    geo_metadatum = models.ForeignKey(GeoMetadatum, on_delete=models.CASCADE, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    tabular_metadatum = models.ForeignKey(TabularMetadatum, on_delete=models.CASCADE, null=True)


class SpectroConfig(models.Model):
    name = models.CharField(max_length=255)
    desc = models.TextField(null=True)
    nfft = models.IntegerField()
    window_size = models.IntegerField()
    overlap = models.FloatField()
    zoom_level = models.IntegerField()

    datasets = models.ManyToManyField(Dataset, related_name='spectro_configs')

    @property
    def zoom_tiles(self):
        n_zooms = int(log(self.zoom_level, 2)) + 1
        for zoom_power in range(0, n_zooms):
            zoom_level = 2**zoom_power
            for zoom_tile in range(0, zoom_level):
                yield f'tile_{zoom_level}_{zoom_tile}.png'



class TabularMetadataVariable(models.Model):
    class Meta:
        db_table = 'tabular_metadata_variables'

    name = models.CharField(max_length=255)
    desc = models.TextField()
    data_type = models.CharField(max_length=255)
    dimension_size = models.IntegerField()
    variable_position = models.IntegerField()

    tabular_metadata = models.ForeignKey(TabularMetadatum, on_delete=models.CASCADE)


class AnnotationCampaign(models.Model):
    class Meta:
        db_table = 'annotation_campaigns'

    name = models.CharField(max_length=255)
    desc = models.TextField()
    instructions_url = models.TextField()
    start = models.DateTimeField()
    end = models.DateTimeField()

    annotation_set = models.ForeignKey(AnnotationSet, on_delete=models.CASCADE)
    datasets = models.ManyToManyField(Dataset)
    spectro_configs = models.ManyToManyField(SpectroConfig, related_name='annotation_campaigns')
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


class CollectionDataset(models.Model):
    class Meta:
        db_table = 'collection_datasets'

    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)


class DatasetFile(models.Model):
    class Meta:
        db_table = 'dataset_files'

    filename = models.CharField(max_length=255)
    filepath = models.CharField(max_length=255)
    size = models.BigIntegerField()

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='files')
    audio_metadatum = models.ForeignKey(AudioMetadatum, on_delete=models.CASCADE, null=True)
    tabular_metadatum = models.ForeignKey(TabularMetadatum, on_delete=models.CASCADE, null=True)


class TabularMetadataShape(models.Model):
    class Meta:
        db_table = 'tabular_metadata_shapes'

    dimension_position = models.IntegerField()

    tabular_metadata_dimension = models.ForeignKey(TabularMetadataVariable, on_delete=models.CASCADE, related_name='dimension')
    tabular_metadata_variable = models.ForeignKey(TabularMetadataVariable, on_delete=models.CASCADE, related_name='variable')


class AnnotationTask(models.Model):
    class Meta:
        db_table = 'annotation_tasks'

    status = models.IntegerField()

    annotation_campaign = models.ForeignKey(AnnotationCampaign, on_delete=models.CASCADE, related_name='tasks')
    annotator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='annotation_tasks')
    dataset_file = models.ForeignKey(DatasetFile, on_delete=models.CASCADE, related_name='annotation_tasks')


class AnnotationResult(models.Model):
    class Meta:
        db_table = 'annotation_results'

    start_time = models.FloatField(null=True)
    end_time = models.FloatField(null=True)
    start_frequency = models.FloatField(null=True)
    end_frequency = models.FloatField(null=True)

    annotation_tag = models.ForeignKey(AnnotationTag, on_delete=models.CASCADE)
    annotation_task = models.ForeignKey(AnnotationTask, on_delete=models.CASCADE, related_name='results')


class AnnotationSession(models.Model):
    class Meta:
        db_table = 'annotation_sessions'

    start = models.DateTimeField()
    end = models.DateTimeField()
    session_output = models.JSONField()

    annotation_task = models.ForeignKey(AnnotationTask, on_delete=models.CASCADE, related_name='sessions')
