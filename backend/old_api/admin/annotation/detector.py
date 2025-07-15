"""Detector model"""
from django.contrib import admin


class DetectorAdmin(admin.ModelAdmin):
    """Detector in DjangoAdmin"""

    search_fields = ["name", "configurations__configuration"]
    list_display = ["name"]


class DetectorConfigurationAdmin(admin.ModelAdmin):
    """Detector in DjangoAdmin"""

    search_fields = ["configuration", "detector"]
    list_display = ["configuration", "detector"]
