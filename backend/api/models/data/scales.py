"""Spectrogram scale models"""

from django.db import models


class LinearScale(models.Model):
    """Linear spectrogram scale"""

    def __str__(self):
        if self.name:
            return self.name
        return f"Linear ({self.min_value} - {self.max_value})[{self.ratio}]"

    name = models.CharField(max_length=255, blank=True, null=True)
    ratio = models.FloatField(default=1)
    min_value = models.FloatField()
    max_value = models.FloatField()


class MultiLinearScale(models.Model):
    """Multi-linear spectrogram scale"""

    def __str__(self):
        if self.name:
            return self.name
        return f"Multi-Linear {self.id}"

    name = models.CharField(max_length=255, blank=True, null=True)
    inner_scales = models.ManyToManyField(LinearScale, related_name="outer_scales")
