"""Phase model"""
from django.conf import settings
from django.db import models

from .annotation_campaign import AnnotationCampaign


class AnnotationPhase(models.Model):
    """Annotation campaign phase"""

    class Type(models.TextChoices):
        """Available type of phases of the annotation campaign"""

        ANNOTATION = "A", "Annotation"
        VERIFICATION = "V", "Verification"

    class Meta:
        unique_together = (("phase", "annotation_campaign"),)

    def __str__(self):
        return f"{self.annotation_campaign} - {self.Type(self.phase).label}"

    phase = models.CharField(choices=Type.choices, max_length=1)
    annotation_campaign = models.ForeignKey(
        AnnotationCampaign,
        on_delete=models.CASCADE,
        related_name="phases",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_phases",
    )

    ended_at = models.DateTimeField(blank=True, null=True)
    ended_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ended_phases",
        blank=True,
        null=True,
    )

    # TODO:
    #  @property
    #  def is_open(self) -> bool:
    #      """Get open state of the phase"""
    #      if not self.ended_at or not self.ended_by:
    #          return True
    #      return False

    # TODO:
    #  def end(self, user: User):
    #      """End the phase"""
    #      self.ended_at = timezone.now()
    #      self.ended_by = user
    #      self.save()
