"""OSmOSE Website API Models - TeamMembers"""
from django.db import models

from .scientist import Scientist


class TeamMember(models.Model):
    """TeamMember model"""

    level = models.IntegerField("Sorting level", blank=True, null=True)

    scientist = models.ForeignKey(
        to=Scientist,
        on_delete=models.RESTRICT,
        related_name="team_members",
    )
    position = models.CharField(max_length=255)

    biography = models.TextField(blank=True, null=True)
    picture = models.URLField()

    mail_address = models.EmailField("Mail address", blank=True, null=True)
    research_gate_url = models.URLField("Research Gate URL", blank=True, null=True)
    personal_website_url = models.URLField(
        "Personal website URL", blank=True, null=True
    )
    github_url = models.URLField("Github URL", blank=True, null=True)
    linkedin_url = models.URLField("LinkedIn URL", blank=True, null=True)
    is_former_member = models.BooleanField("Is former member", default=False)

    class Meta:
        ordering = ["level"]

    def __str__(self):
        return self.scientist.__str__()
