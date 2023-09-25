"""News-related models"""

from django.db import models
from tinymce.models import HTMLField

class News(models.Model):
    class Meta:
        db_table = "news"

    title = models.CharField(max_length=255, unique=True)
    body = HTMLField()