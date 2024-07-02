"""Spectrogram model"""
from django.db import models

from ..datasets import Dataset
from .scales import LinearScale, MultiLinearScale


class WindowType(models.Model):
    """
    This table contains window_type which are in spectrogram configuration
    """

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)


class SpectrogramConfiguration(models.Model):
    """
    Table containing spectrogram configuration used for datasets and annotation campaigns.
    """

    class Meta:
        constraints = [
            models.UniqueConstraint(
                name="api_spectrogramconfiguration_name_dataset_unicity_constraint",
                fields=["name", "dataset_id"],
            ),
            models.CheckConstraint(
                name="spectrogramconfiguration_max_one_scale",
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
        return f"{self.name} - {self.dataset}"

    name = models.CharField(max_length=255)
    desc = models.TextField(null=True, blank=True)
    nfft = models.IntegerField()
    window_size = models.IntegerField()
    overlap = models.FloatField()
    zoom_level = models.IntegerField()
    spectro_normalization = models.CharField(max_length=255)
    data_normalization = models.CharField(max_length=255)
    zscore_duration = models.CharField(max_length=255, null=True, blank=True)
    hp_filter_min_freq = models.IntegerField()
    colormap = models.CharField(max_length=255)
    dynamic_min = models.IntegerField()
    dynamic_max = models.IntegerField()
    window_type = models.ForeignKey(
        WindowType, on_delete=models.CASCADE, blank=True, null=True
    )
    frequency_resolution = models.FloatField()
    temporal_resolution = models.FloatField(null=True, blank=True)
    dataset = models.ForeignKey(
        Dataset, on_delete=models.CASCADE, related_name="spectro_configs"
    )
    sensitivity_dB = models.FloatField(null=True, blank=True)
    spectro_duration = models.FloatField(null=True, blank=True)
    peak_voltage = models.FloatField(null=True, blank=True)
    gain_dB = models.FloatField(null=True, blank=True)
    audio_file_dataset_overlap = models.FloatField(null=True, blank=True)
    time_resolution_zoom_0 = models.FloatField(default=0)
    time_resolution_zoom_1 = models.FloatField(default=0)
    time_resolution_zoom_2 = models.FloatField(default=0)
    time_resolution_zoom_3 = models.FloatField(default=0)
    time_resolution_zoom_4 = models.FloatField(default=0)
    time_resolution_zoom_5 = models.FloatField(default=0)
    time_resolution_zoom_6 = models.FloatField(default=0)
    time_resolution_zoom_7 = models.FloatField(default=0)
    time_resolution_zoom_8 = models.FloatField(default=0)

    linear_frequency_scale = models.ForeignKey(
        LinearScale, on_delete=models.SET_NULL, blank=True, null=True
    )
    multi_linear_frequency_scale = models.ForeignKey(
        MultiLinearScale, on_delete=models.SET_NULL, blank=True, null=True
    )

    def zoom_tiles(self, tile_name):
        """Generate zoom tile filenames for SpectrogramConfiguration"""
        for zoom_power in range(0, self.zoom_level + 1):
            zoom_level = 2**zoom_power
            for zoom_tile in range(0, zoom_level):
                yield f"{tile_name}_{zoom_level}_{zoom_tile}.png"
