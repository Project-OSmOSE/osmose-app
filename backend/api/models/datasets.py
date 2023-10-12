"""Dataset-related models"""

from django.db import models
from django.conf import settings


class Collection(models.Model):
    """
    This table contains collections which are groups of datasets which are meant to be logical groupings, for example
    datasets coming from a common project.
    """

    class Meta:
        db_table = "collections"

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)


class DatasetType(models.Model):
    """
    Table containing the possible data types for dataset’s. These data types are not about the technical storage of the
    data (csv or wav for example) but more about the domain applications (sea currents, weather data, etc…).
    """

    class Meta:
        db_table = "dataset_types"

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField()


class Dataset(models.Model):
    """
    This table contains general metadata of the dataset as well as links to other metadata tables with more specific
    scopes.

    Specific metadata like audio_metadata can be specified either at dataset level or at dataset_file level.
    It can be specified in both with parameters (or other information) common to all files written at dataset level
    and changing parameters at file level.
    """

    class Meta:
        db_table = "datasets"
        ordering = ["name", "created_at"]

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    dataset_path = models.CharField(max_length=255)
    dataset_conf = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Specific configuration folder used for this dataset",
    )
    status = models.IntegerField()
    files_type = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    audio_metadatum = models.ForeignKey(
        "AudioMetadatum", on_delete=models.CASCADE, null=True, blank=True
    )
    dataset_type = models.ForeignKey(DatasetType, on_delete=models.CASCADE)
    geo_metadatum = models.ForeignKey(
        "GeoMetadatum", on_delete=models.CASCADE, null=True, blank=True
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tabular_metadatum = models.ForeignKey(
        "TabularMetadatum", on_delete=models.CASCADE, null=True, blank=True
    )
    spectro_configs = models.ManyToManyField("SpectroConfig", related_name="datasets")
    collections = models.ManyToManyField(Collection, related_name="datasets")


class DatasetFile(models.Model):
    """
    This table contains the metadata and link to metadata of the different files composing a dataset.

    Specific metadata like audio_metadata can be specified either at dataset level or at dataset_file level.
    It can be specified in both with parameters (or other information) common to all files written at dataset level
    and changing parameters at file level.
    """

    class Meta:
        db_table = "dataset_files"

    def __str__(self):
        return str(self.filename)

    filename = models.CharField(max_length=255)
    filepath = models.CharField(max_length=255)
    size = models.BigIntegerField()

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="files")
    audio_metadatum = models.ForeignKey(
        "AudioMetadatum", on_delete=models.CASCADE, null=True, blank=True
    )
    tabular_metadatum = models.ForeignKey(
        "TabularMetadatum", on_delete=models.CASCADE, null=True, blank=True
    )

    @property
    def dataset_sr(self):
        """Returns data from file audio_metadatum if there, else from dataset audio_metadatum"""
        # Pylint can't follow foreign keys when using string identifiers instead of model
        # pylint: disable=no-member
        df_sample_rate = self.audio_metadatum.dataset_sr
        ds_sample_rate = self.dataset.audio_metadatum.dataset_sr
        sample_rate = df_sample_rate if df_sample_rate else ds_sample_rate
        return sample_rate
