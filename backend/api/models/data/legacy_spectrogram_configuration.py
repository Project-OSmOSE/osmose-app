"""Spectrogram model"""
from django.contrib.postgres.fields import ArrayField
from django.db import models

from .scales import LinearScale, MultiLinearScale


class LegacySpectrogramConfiguration(models.Model):
    """
    Table containing spectrogram configuration used for datasets and annotation campaigns.
    """

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="legacy_spectrogram_configuration_max_one_scale",
                check=(
                    models.Q(
                        linear_frequency_scale__isnull=True,
                        multi_linear_frequency_scale__isnull=False,
                    )
                    | models.Q(
                        linear_frequency_scale__isnull=False,
                        multi_linear_frequency_scale__isnull=True,
                    )
                    | models.Q(
                        linear_frequency_scale__isnull=True,
                        multi_linear_frequency_scale__isnull=True,
                    )
                ),
            ),
        ]

    def __str__(self):
        return self.folder

    folder = models.CharField(max_length=255)
    audio_files_subtypes = ArrayField(
        models.CharField(max_length=255), blank=True, null=True
    )
    channel_count = models.IntegerField(blank=True, null=True)
    file_overlap = models.IntegerField(blank=True, null=True)
    zoom_level = models.IntegerField()
    hp_filter_min_frequency = models.IntegerField()
    data_normalization = models.CharField(max_length=255)
    frequency_resolution = models.FloatField()
    spectrogram_normalization = models.CharField(max_length=255)
    zscore_duration = models.CharField(max_length=255, null=True, blank=True)
    window_type = models.CharField(max_length=255, null=True, blank=True)
    peak_voltage = models.FloatField(null=True, blank=True)
    sensitivity_dB = models.FloatField(null=True, blank=True)
    temporal_resolution = models.FloatField(null=True, blank=True)
    gain_dB = models.FloatField(null=True, blank=True)

    linear_frequency_scale = models.ForeignKey(
        LinearScale, on_delete=models.SET_NULL, blank=True, null=True
    )
    multi_linear_frequency_scale = models.ForeignKey(
        MultiLinearScale, on_delete=models.SET_NULL, blank=True, null=True
    )

    # TODO:
    #  def zoom_tiles(self, tile_name):
    #      """Generate zoom tile filenames for SpectrogramConfiguration"""
    #      for zoom_power in range(0, self.zoom_level + 1):
    #          zoom_level = 2**zoom_power
    #          for zoom_tile in range(0, zoom_level):
    #              yield f"{tile_name}_{zoom_level}_{zoom_tile}.png"
