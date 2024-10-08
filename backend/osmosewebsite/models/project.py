"""Projects-related models"""

from django.db import models
from tinymce.models import HTMLField
from metadatax.models import Project as MetadataxProject
from .team_member import TeamMember
from .collaborator import Collaborator


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

    contact = models.ManyToManyField(TeamMember, blank=True)
    collaborators = models.ManyToManyField(Collaborator, blank=True)

    metadatax_project = models.OneToOneField(
        MetadataxProject,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="website_project",
    )
