"""Detector model"""
from django.db import models


class Detector(models.Model):
    """
    This table represents a detector
    """

    class Meta:
        ordering = ["name"]

    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class DetectorConfiguration(models.Model):
    """
    This table represents a detector
    """

    configuration = models.TextField(null=True, blank=True)
    detector = models.ForeignKey(
        Detector, on_delete=models.CASCADE, related_name="configurations"
    )

    def __str__(self):
        return self.detector.name + ": " + self.configuration
