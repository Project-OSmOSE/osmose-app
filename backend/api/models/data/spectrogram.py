"""Spectrogram model"""
from django.db import models

from .__abstract_file import File
from .__abstract_time_segment import TimeSegment
from .spectrogram_analysis import SpectrogramAnalysis


class Spectrogram(File, TimeSegment, models.Model):
    """Spectrogram model"""

    class Meta:
        ordering = ("start", "id")

    def __str__(self):
        return f"{self.filename}.{self.format}"

    analysis = models.ManyToManyField(SpectrogramAnalysis, related_name="spectrograms")
