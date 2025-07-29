"""Spectrogram analysis model"""

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, Q
from typing_extensions import deprecated

from .__abstract_analysis import AbstractAnalysis
from .colormap import Colormap
from .dataset import Dataset
from .fft import FFT
from .legacy_spectrogram_configuration import LegacySpectrogramConfiguration


class SpectrogramAnalysis(AbstractAnalysis, models.Model):
    """Spectrogram analysis"""

    class Meta:
        verbose_name_plural = "Spectrogram analysis"
        constraints = [
            CheckConstraint(
                name="spectrogram_analysis_legacy",
                check=Q(legacy=False, data_duration__isnull=False)
                | Q(legacy=True, legacy_configuration__isnull=False),
            )
        ]
        ordering = ("-created_at",)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="spectrogram_analysis",
    )

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="spectrogram_analysis",
    )

    data_duration = models.FloatField(
        help_text="Duration of the segmented data (in s)", blank=True, null=True
    )

    fft = models.ForeignKey(
        FFT, on_delete=models.PROTECT, related_name="spectrogram_analysis"
    )
    colormap = models.ForeignKey(
        Colormap, on_delete=models.PROTECT, related_name="spectrogram_analysis"
    )
    legacy_configuration = models.ForeignKey(
        LegacySpectrogramConfiguration,
        on_delete=models.PROTECT,
        related_name="spectrogram_analysis",
        blank=True,
        null=True,
    )

    dynamic_min = models.FloatField()
    dynamic_max = models.FloatField()

    # TODO:
    #  @property
    #  def full_spectrogram_path(self) -> Path:
    #      """Return full image path"""
    #      return Path(
    #          join(
    #              str(settings.DATASET_IMPORT_FOLDER),
    #              self.dataset.path,
    #              self.path,
    #              "spectrogram" if not self.legacy else "image",
    #          )
    #      )

    @deprecated("Related to legacy OSEkit")
    def legacy_audio_metadatum_csv(self) -> str:
        """Legacy audio metadata CSV export"""
        header = [
            "dataset",
            "analysis",
            "files_subtypes",
            "channel_count",
            "audio_file_count",
            "start_date",
            "end_date",
            "dataset_sr",
            "audio_file_dataset_duration",
        ]
        data = [header]
        metadatum_data = []
        for label in header:
            if label == "dataset":
                metadatum_data.append(self.dataset.name)
            elif label == "analysis":
                metadatum_data.append(self.name)
            elif label == "files_subtypes":
                metadatum_data.append(
                    f'"{str(self.legacy_configuration.audio_files_subtypes)}"'
                )
            elif label == "channel_count":
                metadatum_data.append(str(self.legacy_configuration.channel_count))
            elif label == "audio_file_count":
                metadatum_data.append(str(self.spectrograms.count()))
            elif label == "start_date":
                metadatum_data.append(
                    str(min(*self.spectrograms.values_list("start", flat=True)))
                )
            elif label == "end_date":
                metadatum_data.append(
                    str(max(*self.spectrograms.values_list("end", flat=True)))
                )
            elif label == "dataset_sr":
                metadatum_data.append(str(self.fft.sampling_frequency))
            elif label == "audio_file_dataset_duration":
                metadatum_data.append(str(self.data_duration))
        data.append(metadatum_data)

        return "\n".join([",".join(line) for line in data])

    @deprecated("Related to legacy OSEkit")
    def legacy_spectrogram_configuration_csv(self) -> str:
        """Legacy spectrogram configuration CSV export"""

        header = [
            "dataset_name",
            "analysis_name",
            "dataset_sr",
            "nfft",
            "window_size",
            "overlap",
            "colormap",
            "zoom_level",
            "dynamic_min",
            "dynamic_max",
            "spectro_duration",
            "data_normalization",
            "hp_filter_min_freq",
            "sensitivity_dB",  # seulement pour normalisation instrument / vide pour zscore
            "peak_voltage",  # seulement pour normalisation instrument / vide pour zscore
            "gain_dB",  # seulement pour normalisation instrument / vide pour zscore
            "spectro_normalization",
            "zscore_duration",  # seulement pour normalisation zscore / vide pour instrument
            "window_type",
            "frequency_resolution",
            "temporal_resolution",
            "audio_file_dataset_overlap",
        ]
        data = [header]
        config_data = []
        for label in header:
            if label == "dataset_name":
                config_data.append(self.dataset.name)
            elif label == "analysis_name":
                config_data.append(self.name)
            elif label == "dataset_sr":
                config_data.append(str(self.fft.sampling_frequency))
            elif label == "nfft":
                config_data.append(str(self.fft.nfft))
            elif label == "window_size":
                config_data.append(str(self.fft.window_size))
            elif label == "overlap":
                config_data.append(str(self.fft.overlap * 100))
            elif label == "colormap":
                config_data.append(self.colormap.name)
            elif label == "dynamic_min":
                config_data.append(str(self.dynamic_min))
            elif label == "dynamic_max":
                config_data.append(str(self.dynamic_max))
            elif label == "spectro_duration":
                config_data.append(str(self.data_duration))
            elif label == "spectro_normalization":
                config_data.append(
                    str(self.legacy_configuration.spectrogram_normalization)
                )
            elif label == "hp_filter_min_freq":
                config_data.append(
                    str(self.legacy_configuration.hp_filter_min_frequency)
                )
            elif label == "audio_file_dataset_overlap":
                config_data.append(str(self.legacy_configuration.file_overlap))
            else:
                config_data.append(str(getattr(self.legacy_configuration, label)))

        data.append(config_data)

        return "\n".join([",".join(line) for line in data])
