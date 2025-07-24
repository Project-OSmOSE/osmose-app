"""Datasets models"""
from django.db import models
from metadatax.acquisition.models import ChannelConfiguration

from .__abstract_dataset import AbstractDataset


class Dataset(AbstractDataset, models.Model):
    """Dataset"""

    class Meta:
        unique_together = (
            "name",
            "path",
        )
        ordering = ("-created_at",)

    def __str__(self):
        return self.name

    related_channel_configurations = models.ManyToManyField(
        ChannelConfiguration, related_name="datasets"
    )
