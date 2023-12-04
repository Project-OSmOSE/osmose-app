"""News-related models"""

from django.db import models
from django.contrib.postgres import fields
from tinymce.models import HTMLField
from .team_member import TeamMember


class News(models.Model):
    """
    Table containing news will be used on the website
    """

    class Meta:
        verbose_name_plural = "news"
        ordering = ["-date"]

    title = models.CharField(max_length=255, unique=True)
    intro = models.CharField(max_length=255)
    body = HTMLField()
    date = models.DateField(null=True, blank=True)
    vignette = models.URLField(default="")

    osmose_member_authors = models.ManyToManyField(TeamMember, blank=True)
    other_authors = fields.ArrayField(
        models.CharField(max_length=255, blank=True), null=True, blank=True
    )
