"""API annotation acoustic features administration"""
from django.contrib import admin

from backend.api.models import AcousticFeatures
from backend.utils.admin import get_edit_link


@admin.register(AcousticFeatures)
class AcousticFeaturesAdmin(admin.ModelAdmin):
    """AcousticFeatures presentation in DjangoAdmin"""

    list_display = (
        "id",
        "start_frequency",
        "end_frequency",
        "relative_max_frequency_count",
        "relative_min_frequency_count",
        "inflexion_point_count",
        "steps_count",
        "has_harmonics",
        "trend",
        "get_annotation",
    )

    search_fields = ("annotation__annotation_phase__annotation_campaign__name",)

    @admin.display(description="Annotation")
    def get_annotation(self, obj: AcousticFeatures):
        """Get annotation edit link"""
        return get_edit_link("admin:api_annotation_change", obj.annotation)
