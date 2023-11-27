from django.db import models
from django.contrib import admin


class TeamMember(models.Model):
    level = models.IntegerField("Sorting level", blank=True, null=True)

    name = models.CharField(max_length=100)
    position = models.CharField(max_length=255)
    biography = models.TextField()
    picture = models.URLField()

    mailAddress = models.EmailField("Mail address")

    researchGateURL = models.URLField("Research Gate URL", blank=True, null=True)
    personalWebsiteURL = models.URLField("Personal website URL", blank=True, null=True)
    githubURL = models.URLField("Github URL", blank=True, null=True)
    linkedinURL = models.URLField("LinkedIn URL", blank=True, null=True)

    isFormerMember = models.BooleanField("Is former member", default=False)

    class Meta:
        ordering=['level']

    def __str__(self):
        return self.name
