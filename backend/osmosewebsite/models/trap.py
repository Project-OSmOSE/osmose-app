"""Trap-related models"""

from django.db import models


class Trap(models.Model):
    """
    Table containing Trap will be used on the website
    """

    title = models.CharField(max_length=255, unique=True)
    presenter_firstname = models.CharField(max_length=100, default="DefaultFirstName")
    presenter_lastname = models.CharField(max_length=100, blank=True, null=True)
    intro = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    thumbnail = models.URLField(default="")
    presenter_linkedin_url = models.URLField(blank=True, null=True)
    presenter_mail_address = models.EmailField(blank=True, null=True)
    presenter_research_gate_url = models.URLField(
        "Research Gate URL", blank=True, null=True
    )

    class Meta:
        verbose_name_plural = "trap"
        ordering = ["-date"]
