from django.db import models


class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=255)
    biography = models.TextField()
    picture = models.URLField()

    mailAddress = models.EmailField()

    researchGateURL = models.URLField(blank=True, null=True)
    personalWebsiteURL = models.URLField(blank=True, null=True)
    githubURL = models.URLField(blank=True, null=True)
    linkedinURL = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name
