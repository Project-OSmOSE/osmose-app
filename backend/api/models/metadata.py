"""Metadata-related models"""

from math import log

from django.db import models


class AudioMetadatum(models.Model):
    class Meta:
        db_table = 'audio_metadata'

    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    num_channels = models.IntegerField(null=True, blank=True)
    sample_rate_khz = models.FloatField(null=True, blank=True)
    total_samples = models.IntegerField(null=True, blank=True)
    sample_bits = models.IntegerField(null=True, blank=True)
    gain_db = models.FloatField(null=True, blank=True)
    gain_rel = models.FloatField(null=True, blank=True)
    dutycycle_rdm = models.FloatField(null=True, blank=True)
    dutycycle_rim = models.FloatField(null=True, blank=True)


class GeoMetadatum(models.Model):
    class Meta:
        db_table = 'geo_metadata'

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField()
    location = models.TextField()
    region = models.TextField()


class SpectroConfig(models.Model):
    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    nfft = models.IntegerField()
    window_size = models.IntegerField()
    overlap = models.FloatField()
    zoom_level = models.IntegerField()

    def zoom_tiles(self, tile_name):
        n_zooms = int(log(self.zoom_level, 2)) + 1
        for zoom_power in range(0, n_zooms):
            zoom_level = 2**zoom_power
            for zoom_tile in range(0, zoom_level):
                yield f'{tile_name}_{zoom_level}_{zoom_tile}.png'


class TabularMetadatum(models.Model):
    class Meta:
        db_table = 'tabular_metadata'

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField()
    dimension_count = models.IntegerField()
    variable_count = models.IntegerField()


class TabularMetadataVariable(models.Model):
    class Meta:
        db_table = 'tabular_metadata_variables'

    name = models.CharField(max_length=255)
    desc = models.TextField()
    data_type = models.CharField(max_length=255)
    dimension_size = models.IntegerField()
    variable_position = models.IntegerField()

    tabular_metadata = models.ForeignKey(TabularMetadatum, on_delete=models.CASCADE)


class TabularMetadataShape(models.Model):
    class Meta:
        db_table = 'tabular_metadata_shapes'

    dimension_position = models.IntegerField()

    tabular_metadata_dimension = models.ForeignKey(TabularMetadataVariable, on_delete=models.CASCADE, related_name='dimension')
    tabular_metadata_variable = models.ForeignKey(TabularMetadataVariable, on_delete=models.CASCADE, related_name='variable')
