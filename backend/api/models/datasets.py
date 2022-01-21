"""Dataset-related models"""

from django.db import models
from django.contrib.auth.models import User


class Collection(models.Model):
    class Meta:
        db_table = 'collections'

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class DatasetType(models.Model):
    class Meta:
        db_table = 'dataset_types'

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField()


class Dataset(models.Model):
    class Meta:
        db_table = 'datasets'

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    dataset_path = models.CharField(max_length=255)
    dataset_conf = models.CharField(max_length=255, null=True, blank=True,
        help_text='Specific configuration folder used for this dataset')
    status = models.IntegerField()
    files_type = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    audio_metadatum = models.ForeignKey('AudioMetadatum', on_delete=models.CASCADE, null=True, blank=True)
    dataset_type = models.ForeignKey(DatasetType, on_delete=models.CASCADE)
    geo_metadatum = models.ForeignKey('GeoMetadatum', on_delete=models.CASCADE, null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    tabular_metadatum = models.ForeignKey('TabularMetadatum', on_delete=models.CASCADE, null=True, blank=True)
    spectro_configs = models.ManyToManyField('SpectroConfig', related_name='datasets')



class CollectionDataset(models.Model):
    class Meta:
        db_table = 'collection_datasets'

    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)


class DatasetFile(models.Model):
    class Meta:
        db_table = 'dataset_files'

    def __str__(self):
        return str(self.filename)

    filename = models.CharField(max_length=255)
    filepath = models.CharField(max_length=255)
    size = models.BigIntegerField()

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='files')
    audio_metadatum = models.ForeignKey('AudioMetadatum', on_delete=models.CASCADE, null=True, blank=True)
    tabular_metadatum = models.ForeignKey('TabularMetadatum', on_delete=models.CASCADE, null=True, blank=True)
