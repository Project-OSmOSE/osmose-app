"""OSmOSE Website API Models - TeamMembers"""
from django.db import models
from django.db.models import signals
from django.dispatch import receiver


class TeamMember(models.Model):
    """TeamMember model"""

    level = models.IntegerField("Sorting level", blank=True, null=True)

    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100, blank=True, null=True)
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
        if self.lastname:
            return self.firstname + " " + self.lastname
        return self.firstname


@receiver(
    signal=signals.pre_delete,
    sender=TeamMember,
)
def on_author_team_member_deleted(sender, instance: TeamMember, **kwargs):
    """On author team member is deleted, replace it by its name"""

    instance.authors.update(
        name=f"{instance.lastname}, {instance.firstname[0]}.",
        team_member=None,
    )
