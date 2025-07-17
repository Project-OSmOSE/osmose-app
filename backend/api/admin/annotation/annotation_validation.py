"""API annotation annotation validation administration"""
from django.contrib import admin

from backend.api.models import AnnotationValidation


@admin.register(AnnotationValidation)
class AnnotationValidationAdmin(admin.ModelAdmin):
    """AnnotationValidation presentation in DjangoAdmin"""

    list_display = (
        "id",
        "is_valid",
        "annotator",
        "annotation",
        "annotation",
        "get_detector",
    )

    search_fields = (
        "annotator__username",
        "annotator__first_name",
        "annotator__last_name",
        "annotation__detector_configuration__detector__name",
    )

    list_filter = ("is_valid",)

    @admin.display(description="Campaign")
    def get_campaign(self, obj: AnnotationValidation):
        """Get campaign for given result validation"""
        return obj.annotation.annotation_phase.annotation_campaign

    @admin.display(description="Detector")
    def get_detector(self, obj: AnnotationValidation):
        """Get detector for given result validation"""
        conf = obj.annotation.detector_configuration
        if conf is None:
            return None
        return conf.detector
