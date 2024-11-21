"""ScientificTalk-related models"""

from django.contrib.postgres import fields
from django.db import models

from .team_member import TeamMember


class ScientificTalk(models.Model):
    """
    Table containing ScientificTalk will be used on the website
    """

    title = models.CharField(max_length=255, unique=True)
    intro = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    thumbnail = models.URLField(default="")

    osmose_member_presenters = models.ManyToManyField(TeamMember, blank=True)
    other_presenters = fields.ArrayField(
        models.CharField(max_length=255, blank=True), null=True, blank=True
    )

    class Meta:
        ordering = ["-date"]
