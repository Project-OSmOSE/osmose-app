"""Abstract analysis model"""
from django.db import models

from .__abstract_dataset import AbstractDataset
from .dataset import Dataset


class AbstractAnalysis(AbstractDataset, models.Model):
    """Abstract analysis"""

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
