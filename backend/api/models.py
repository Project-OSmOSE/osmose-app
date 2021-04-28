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
    desc = models.TextField()
    tags = models.ManyToManyField(AnnotationTag)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class Collection(models.Model):
    class Meta:
        db_table = 'collections'

    name = models.CharField(max_length=255)
    desc = models.TextField()

    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class Dataset(models.Model):
    class Meta:
        db_table = 'datasets'

    name = models.CharField(max_length=255)
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
    owner = models.ForeignKey(User, on_delete=models.CASCADE)


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

    audio_metadata = models.ForeignKey(AudioMetadatum, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='dataset_files')
    tabular_metadata = models.ForeignKey(TabularMetadatum, on_delete=models.CASCADE)


class TabularMetadataShape(models.Model):
    class Meta:
        db_table = 'tabular_metadata_shapes'

    dimension_position = models.IntegerField()

    tabular_metadata_dimension = models.ForeignKey(TabularMetadataVariable, on_delete=models.CASCADE, related_name='dimension')
    tabular_metadata_variable = models.ForeignKey(TabularMetadataVariable, on_delete=models.CASCADE, related_name='variable')


class AnnotationCampaignDataset(models.Model):
    class Meta:
        db_table = 'annotation_campaign_datasets'


    annotation_campaign = models.ForeignKey(AnnotationCampaign, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)


class AnnotationTask(models.Model):
    class Meta:
        db_table = 'annotation_tasks'

    status = models.IntegerField()

    annotation_campaign = models.ForeignKey(AnnotationCampaign, on_delete=models.CASCADE)
    annotator = models.ForeignKey(User, on_delete=models.CASCADE)
    dataset_file = models.ForeignKey(DatasetFile, on_delete=models.CASCADE)


class AnnotationResult(models.Model):
    class Meta:
        db_table = 'annotation_results'

    startTime = models.FloatField()
    endTime = models.FloatField()
    startFrequency = models.FloatField()
    endFrequency = models.FloatField()

    annotation_tag = models.ForeignKey(AnnotationTag, on_delete=models.CASCADE)
    annotation_task = models.ForeignKey(AnnotationTask, on_delete=models.CASCADE)


class AnnotationSession(models.Model):
    class Meta:
        db_table = 'annotation_sessions'

    start = models.DateTimeField()
    end = models.DateTimeField()
    session_output = models.JSONField()

    annotation_task = models.ForeignKey(AnnotationTask, on_delete=models.CASCADE)
