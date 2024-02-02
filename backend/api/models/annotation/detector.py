"""Detector model"""
from django.db import models


class Detector(models.Model):
    """
    This table represents a detector
    """

    class Meta:
        ordering = ["name"]

    name = models.CharField(max_length=255, unique=True)
    parameters = models.TextField(null=True, blank=True)
