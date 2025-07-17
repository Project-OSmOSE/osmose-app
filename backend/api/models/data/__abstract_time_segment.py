"""File model - Abstract"""
from django.db import models


class TimeSegment(models.Model):
    """TimeSegment model - Abstract"""

    class Meta:
        abstract = True

    start = models.DateTimeField()
    end = models.DateTimeField()

    @property
    def duration(self) -> float:
        """Duration of the segment"""
        timedelta = self.end - self.start
        return timedelta.total_seconds()
