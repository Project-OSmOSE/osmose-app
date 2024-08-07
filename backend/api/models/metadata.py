"""Metadata-related models"""

from django.db import models


class AudioMetadatum(models.Model):
    """
    This table contains the metadata to audio recordings like hydrophone readings for example.

    We follow the same dutycycle convention as Tethys: Duty cycle is represented by the recording duration and the
    interval from the start of one recording session to the next. A duration of 3 m and an interval of 5 m would
    represent a 60% duty cycle, 3 m on, 2 m off.
    """

    class Meta:
        db_table = "audio_metadata"

    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    channel_count = models.IntegerField(null=True, blank=True)
    dataset_sr = models.FloatField(null=True, blank=True)
    total_samples = models.IntegerField(null=True, blank=True)
    sample_bits = models.IntegerField(null=True, blank=True)
    audio_file_count = models.IntegerField(null=True, blank=True)
    gain_db = models.FloatField(null=True, blank=True)
    gain_rel = models.FloatField(null=True, blank=True)
    dutycycle_rdm = models.FloatField(null=True, blank=True)
    dutycycle_rim = models.FloatField(null=True, blank=True)
    audio_file_dataset_duration = models.FloatField(null=True, blank=True)


class GeoMetadatum(models.Model):
    """
    Table containing geographical information on the dataset. It can be either just a name with a description, a
    specific GPS location or geographical region represented by a polygon of GPS coordinates. It can also be a
    combination of those.
    """

    class Meta:
        db_table = "geo_metadata"

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField()
    # TODO : move to PostGIS-aware fields, see https://docs.djangoproject.com/en/3.2/ref/contrib/gis/
    location = models.TextField()
    region = models.TextField()
