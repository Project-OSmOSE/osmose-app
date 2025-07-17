"""Archive model"""
from django.conf import settings
from django.db import models


class Archive(models.Model):
    """AnnotationCampaign archive information"""

    def __str__(self):
        return str(self.date) + " | " + str(self.by_user)

    date = models.DateTimeField(auto_now_add=True)
    by_user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        related_name="archives",
        on_delete=models.SET_NULL,
        null=True,
    )
