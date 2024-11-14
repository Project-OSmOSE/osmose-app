"""Confidence related models"""
from django.db import models
from django.db.models import Q


class ConfidenceIndicatorSet(models.Model):
    """
    This table contains collections of confidence indicator to be used for annotation campaign.
    A confidence indicator set is created by a staff user.
    """

    class Meta:
        db_table = "confidence_sets"

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)

    @property
    def max_level(self):
        """Give the max level among confidence indicators"""
        return max(i.level for i in self.confidence_indicators.all())


class ConfidenceIndicator(models.Model):
    """
    This table contains confidence indicator in which are used to constitute confidence indicator set and serve
    to annotate files for annotation campaign.
    """

    class Meta:
        db_table = "confidence_indicator"
        constraints = [
            models.UniqueConstraint(
                name="one_default_by_confidence_indicator_set",
                fields=["is_default", "confidence_indicator_set"],
                condition=Q(is_default=True),
            ),
        ]
        unique_together = ("confidence_indicator_set", "label")

    def __str__(self):
        return str(self.label)

    label = models.CharField(max_length=255)
    level = models.IntegerField()
    confidence_indicator_set = models.ForeignKey(
        ConfidenceIndicatorSet,
        verbose_name="Included in this set :",
        on_delete=models.CASCADE,
        related_name="confidence_indicators",
    )
    is_default = models.BooleanField(default=False)
