"""Results model"""
from django.db import models
from django.conf import settings

from backend.aplose.models import User
from .detector import DetectorConfiguration


class AnnotationResult(models.Model):
    """
    This table contains the resulting label associations for specific annotation_tasks
    """

    class Meta:
        db_table = "annotation_results"
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
            )
        ]

    start_time = models.FloatField(null=True, blank=True)
    end_time = models.FloatField(null=True, blank=True)
    start_frequency = models.FloatField(null=True, blank=True)
    end_frequency = models.FloatField(null=True, blank=True)

    label = models.ForeignKey("Label", on_delete=models.CASCADE)
    confidence_indicator = models.ForeignKey(
        "ConfidenceIndicator", on_delete=models.SET_NULL, null=True, blank=True
    )
    annotation_campaign = models.ForeignKey(
        "AnnotationCampaign",
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
    dataset_file = models.ForeignKey(
        "DatasetFile",
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


class AnnotationResultValidation(models.Model):
    """
    This table contains the resulting label associations for specific annotation_tasks
    """

    is_valid = models.BooleanField(null=True, blank=True)
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_results_validation",
    )
    result = models.ForeignKey(
        AnnotationResult, on_delete=models.CASCADE, related_name="validations"
    )
