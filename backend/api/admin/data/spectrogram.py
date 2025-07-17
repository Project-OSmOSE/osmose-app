"""API data spectrogram administration"""
from django.contrib import admin

from backend.api.models import Spectrogram
from backend.utils.admin import get_many_to_many


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

    @admin.display(description="Analysis")
    def analysis(self, obj: Spectrogram):
        """Display analysis"""
        return get_many_to_many(obj, "analysis")
