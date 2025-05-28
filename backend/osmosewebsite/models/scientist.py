"""Scientist model"""
from django.db import models


class Institution(models.Model):
    """Scientist institution model"""

    def __str__(self):
        return self.name

    name = models.CharField(max_length=255, unique=True)

    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)


class Scientist(models.Model):
    """Scientist model"""

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    institutions = models.ManyToManyField(Institution, related_name="scientists")

    @property
    def short_name(self) -> str:
        """Get display name for a bibliography author"""
        return f"{self.last_name}, {self.first_name[0]}."
