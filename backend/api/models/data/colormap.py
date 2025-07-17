"""Colormap model"""
from django.db import models


class Colormap(models.Model):
    """Colormap model"""

    class Meta:
        unique_together = ()

    def __str__(self):
        return self.name

    name = models.CharField(max_length=100, unique=True)
