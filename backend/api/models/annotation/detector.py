"""Detector model"""
from django.db import models
from metadatax.equipment.models import AcousticDetectorSpecification


class Detector(models.Model):
    """
    This table represents a detector
    """

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    name = models.CharField(max_length=255, unique=True)
    specification = models.ForeignKey(
        AcousticDetectorSpecification,
        blank=True,
        null=True,
        on_delete=models.deletion.SET_NULL,
    )
