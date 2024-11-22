"""Projects-related models"""

from django.contrib.postgres import fields
from django.db import models
from metadatax.models import Project as MetadataxProject
from tinymce.models import HTMLField

from .collaborator import Collaborator
from .team_member import TeamMember


class Project(models.Model):
    """
    Table containing projects will be used on the website
    """

    class Meta:
        ordering = ["-end"]

    title = models.CharField(max_length=255, unique=True)
    intro = models.CharField(max_length=255)
    start = models.DateField(null=True, blank=True)
    end = models.DateField(null=True, blank=True)
    body = HTMLField()
    thumbnail = models.URLField(default="")

    collaborators = models.ManyToManyField(Collaborator, blank=True)

    osmose_member_contacts = models.ManyToManyField(TeamMember, blank=True)
    other_contacts = fields.ArrayField(
        models.CharField(max_length=255, blank=True), null=True, blank=True
    )

    metadatax_project = models.OneToOneField(
        MetadataxProject,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="website_project",
    )
