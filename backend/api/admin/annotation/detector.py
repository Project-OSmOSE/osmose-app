"""Detector model"""
from django.contrib import admin


class DetectorAdmin(admin.ModelAdmin):
    """Detector in DjangoAdmin"""

    search_fields = ["name", "parameters"]
    list_display = ["name", "parameters"]
