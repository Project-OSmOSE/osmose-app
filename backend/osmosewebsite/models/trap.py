"""Trap-related models"""

from django.db import models
from django.contrib.postgres import fields
from tinymce.models import HTMLField
from .team_member import TeamMember


class Trap(models.Model):
    """
    Table containing Trap will be used on the website
    """

    title = models.CharField(max_length=255, unique=True)
    intro = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    thumbnail = models.URLField(default="")
    osmose_member_authors = models.ManyToManyField(TeamMember, blank=True)
    linkedin_url = models.URLField(blank=True, null=True)
    mail_address = models.EmailField(blank=True, null=True)
    research_gate_url = models.URLField("Research Gate URL", blank=True, null=True)


class Meta:
    verbose_name_plural = "trap"
    ordering = ["-date"]
