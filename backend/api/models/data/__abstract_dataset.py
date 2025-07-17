"""Abstract dataset model"""
from django.conf import settings
from django.db import models


class AbstractDataset(models.Model):
    """Abstract dataset"""

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    path = models.CharField(max_length=255)

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # @deprecated("Do not use this field with the recent version of OSEkit")
    legacy = models.BooleanField(default=False)
