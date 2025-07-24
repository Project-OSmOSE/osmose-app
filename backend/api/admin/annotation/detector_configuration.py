"""API annotation detector configuration administration"""
from django.contrib import admin

from backend.api.models import DetectorConfiguration


@admin.register(DetectorConfiguration)
class DetectorConfigurationAdmin(admin.ModelAdmin):
    """DetectorConfiguration presentation in DjangoAdmin"""

    list_display = (
        "id",
        "detector",
        "configuration",
    )

    search_fields = (
        "detector__name",
        "configuration",
    )
