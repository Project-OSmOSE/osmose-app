"""API annotation annotation file range administration"""
from django.contrib import admin

from backend.api.models import AnnotationFileRange


@admin.register(AnnotationFileRange)
class AnnotationFileRangeAdmin(admin.ModelAdmin):
    """AnnotationFileRange presentation in DjangoAdmin"""

    readonly_fields = (
        "from_datetime",
        "to_datetime",
        "files_count",
    )

    list_display = (
        "id",
        "first_file_index",
        "last_file_index",
        "from_datetime",
        "to_datetime",
        "files_count",
        "annotator",
        "annotation_phase",
    )

    search_fields = (
        "annotation_phase__annotation_campaign__name",
        "annotator__username",
        "annotator__first_name",
        "annotator__last_name",
    )

    list_filter = (
        "annotation_phase__annotation_campaign",
        "annotator",
    )
