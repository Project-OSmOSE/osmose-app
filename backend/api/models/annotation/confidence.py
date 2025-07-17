"""Confidence model"""
from django.db import models


class Confidence(models.Model):
    """
    This table contains confidence indicator in which are used to constitute confidence indicator set and serve
    to annotate files for annotation campaign.
    """

    def __str__(self):
        return str(self.label)

    label = models.CharField(max_length=255)
    level = models.IntegerField()
