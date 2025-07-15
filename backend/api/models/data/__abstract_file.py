"""File model - Abstract"""
from django.db import models
from metadatax.models.data import FileFormat


class File(models.Model):
    """File model - Abstract"""

    class Meta:
        unique_together = ("filename", "format")
        abstract = True

    def __str__(self):
        return f"{self.filename} ({self.format})"

    format = models.ForeignKey(FileFormat, on_delete=models.PROTECT)
    filename = models.CharField(max_length=255)
