"""API annotation annotation administration"""
from django.contrib import admin

from backend.api.models import Annotation


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    """Annotation presentation in DjangoAdmin"""

    list_display = (
        "id",
        "type",
        "start_time",
        "end_time",
        "start_frequency",
        "end_frequency",
        "label",
        "confidence",
        "annotation_phase",
        "spectrogram",
        "annotator",
        "detector_configuration",
        "annotator_expertise_level",
        "acoustic_features",
        "is_update_of",
        "created_at",
        "last_updated_at",
    )
    search_fields = (
        "spectrogram__filename",
        "label__name",
        "confidence__label",
        "annotator__username",
        "annotator__first_name",
        "annotator__last_name",
        "detector_configuration__detector__name",
        "annotation_phase__annotation_campaign__name",
    )
    list_filter = (
        "type",
        "annotator_expertise_level",
        "annotation_phase__annotation_campaign",
        "annotator",
    )
