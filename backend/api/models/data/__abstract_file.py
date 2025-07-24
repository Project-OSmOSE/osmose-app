"""File model - Abstract"""
from django.db import models
from metadatax.data.models import FileFormat


class AbstractFile(models.Model):
    """File model - Abstract"""

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.filename} ({self.format})"

    format = models.ForeignKey(FileFormat, on_delete=models.PROTECT)
    filename = models.CharField(max_length=255)
