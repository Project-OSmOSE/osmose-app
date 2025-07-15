"""Spectrogram model"""
from django.db import models

from .__abstract_file import File
from .spectrogram_analysis import SpectrogramAnalysis


class Spectrogram(File, models.Model):
    """Spectrogram model"""

    class Meta:
        unique_together = ("filename", "format", "analysis")
        ordering = ("start", "id")

    def __str__(self):
        return f"{self.filename}.{self.format}"

    start = models.DateTimeField()
    end = models.DateTimeField()

    analysis = models.ForeignKey(
        SpectrogramAnalysis, on_delete=models.CASCADE, related_name="files"
    )
