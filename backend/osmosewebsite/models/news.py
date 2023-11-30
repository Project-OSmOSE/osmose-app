"""News-related models"""

from django.db import models
from tinymce.models import HTMLField


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
