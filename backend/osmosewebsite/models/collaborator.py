"""OSmOSE Website API Models - Collaborator"""
from django.db import models


class Collaborator(models.Model):
    """Collaborator model"""

    level = models.IntegerField("Sorting level", blank=True, null=True)
    name = models.CharField(max_length=255, unique=True)
    thumbnail = models.URLField()
    url = models.URLField(null=True, blank=True)
    show_on_home_page = models.BooleanField(default=False)
    show_on_aplose_home = models.BooleanField(default=False)

    class Meta:
        ordering = ["level", "name"]

    def __str__(self):
        return self.name
