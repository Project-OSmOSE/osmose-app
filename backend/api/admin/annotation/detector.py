"""API annotation Detector administration"""
from django.contrib import admin

from backend.api.models import Detector


@admin.register(Detector)
class DetectorAdmin(admin.ModelAdmin):
    """Detector presentation in DjangoAdmin"""

    list_display = (
        "id",
        "name",
        "specification"
    )

    search_fields = (
        "name",
        "configurations__configuration"
    )