"""API annotation annotation task administration"""
from django.contrib import admin

from backend.api.models import AnnotationTask


@admin.register(AnnotationTask)
class AnnotationTaskAdmin(admin.ModelAdmin):
    """AnnotationTask presentation in DjangoAdmin"""

    list_display = (
        "id",
        "status",
        "annotation_phase",
        "annotator",
        "spectrogram",
    )

    search_fields = ("spectrogram__filename",)

    list_filter = (
        "status",
        "annotation_phase__annotation_campaign",
        "annotation_phase__phase",
        "annotator",
    )
