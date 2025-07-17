"""Spectrogram analysis model"""

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, Q

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
