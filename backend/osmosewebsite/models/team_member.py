"""OSmOSE Website API Models - TeamMembers"""
from django.db import models


class TeamMember(models.Model):
    """TeamMember model"""

    level = models.IntegerField("Sorting level", blank=True, null=True)

    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=255)
    biography = models.TextField()
    picture = models.URLField()

    mail_address = models.EmailField("Mail address")
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
        return self.firstname + " " + self.lastname
