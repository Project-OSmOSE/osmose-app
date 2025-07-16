"""API data spectrogram administration"""
from django.contrib import admin

from backend.api.models import Spectrogram


@admin.register(Spectrogram)
class SpectrogramAdmin(admin.ModelAdmin):

    list_display = [
        "filename",
        "analysis",
        "start",
        "end",
    ]
    search_fields = [
        "analysis__name",
        "analysis__dataset__name",
    ]
