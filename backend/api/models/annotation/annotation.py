"""Annotation model"""
from typing import Optional

from django.db import models

from backend.aplose.models import User, AploseUser, ExpertiseLevel
from .acoustic_features import AcousticFeatures
from .annotation_phase import AnnotationPhase
from .confidence import Confidence
from .detector_configuration import DetectorConfiguration
from .label import Label
from ..data import Spectrogram


class Annotation(models.Model):
    """
    This table contains the resulting label associations for specific annotation_tasks
    """

    class Type(models.TextChoices):
        """Type of annotation result"""

        WEAK = ("W", "Weak")
        POINT = ("P", "Point")
        BOX = ("B", "Box")

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="require_user_or_detector",
                check=(
                    models.Q(
                        annotator__isnull=True, detector_configuration__isnull=False
                    )
                    | models.Q(
                        annotator__isnull=False, detector_configuration__isnull=True
                    )
                ),
            ),
            models.CheckConstraint(
                name="Annotation type",
                check=(
                    models.Q(
                        type="W",
                        start_time__isnull=True,
                        end_time__isnull=True,
                        start_frequency__isnull=True,
                        end_frequency__isnull=True,
                    )
                    | models.Q(
                        type="P",
                        start_time__isnull=False,
                        end_time__isnull=True,
                        start_frequency__isnull=False,
                        end_frequency__isnull=True,
                    )
                    | models.Q(
                        type="B",
                        start_time__isnull=False,
                        end_time__isnull=False,
                        start_frequency__isnull=False,
                        end_frequency__isnull=False,
                    )
                ),
            ),
        ]

    type = models.TextField(
        choices=Type.choices,
        help_text="Type of the annotation",
    )
    start_time = models.FloatField(null=True, blank=True)
    end_time = models.FloatField(null=True, blank=True)
    start_frequency = models.FloatField(null=True, blank=True)
    end_frequency = models.FloatField(null=True, blank=True)

    label = models.ForeignKey(Label, on_delete=models.CASCADE)
    confidence = models.ForeignKey(
        Confidence, on_delete=models.SET_NULL, null=True, blank=True
    )
    annotation_phase = models.ForeignKey(
        AnnotationPhase,
        on_delete=models.CASCADE,
        related_name="results",
    )
    annotator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="annotation_results",
        null=True,
        blank=True,
    )
    annotator_expertise_level = models.TextField(
        choices=ExpertiseLevel.choices,
        blank=True,
        null=True,
        help_text="Expertise level of the annotator.",
    )

    spectrogram = models.ForeignKey(
        Spectrogram,
        on_delete=models.CASCADE,
        related_name="annotation_results",
        null=True,
        blank=True,
    )
    detector_configuration = models.ForeignKey(
        DetectorConfiguration,
        on_delete=models.CASCADE,
        related_name="annotation_results",
        null=True,
        blank=True,
    )
    acoustic_features = models.OneToOneField(
        AcousticFeatures,
        on_delete=models.SET_NULL,
        related_name="annotation_result",
        blank=True,
        null=True,
        help_text="Acoustic features add a better description to the signal",
    )
    is_update_of = models.ForeignKey(
        "Annotation",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="updated_to",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Save expertise level
        if self.annotator:
            aplose_user: Optional[AploseUser] = AploseUser.objects.filter(
                user_id=self.annotator_id, expertise_level__isnull=False
            ).first()
            if aplose_user is not None:
                self.annotator_expertise_level = aplose_user.expertise_level
            else:
                self.annotator_expertise_level = None
        else:
            self.annotator_expertise_level = None

        # Save type
        if self.start_time is None:
            self.type = Annotation.Type.WEAK
        elif self.end_time is None:
            self.type = Annotation.Type.POINT
        else:
            self.type = Annotation.Type.BOX
        super().save(*args, **kwargs)
