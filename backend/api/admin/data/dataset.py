"""API data dataset administration"""
from django.contrib import admin
from metadatax.utils import JSONExportModelAdmin

from backend.api.models import Dataset
from backend.utils.admin import get_edit_links_for_queryset


@admin.register(Dataset)
class DatasetAdmin(JSONExportModelAdmin):
    """Dataset presentation in DjangoAdmin"""

    list_display = (
        "name",
        "description",
        "created_at",
        "path",
        "legacy",
        "owner",
        "show_spectrogram_analysis",
        "show_channel_configuration",
    )

    search_fields = ["name", "related_channel_configurations__deployment__name"]

    filter_horizontal = [
        "related_channel_configurations",
    ]

    @admin.display(description="Metadatax channel configurations")
    def show_channel_configuration(self, dataset: Dataset) -> str:
        """show_channel_configuration"""
        return get_edit_links_for_queryset(
            dataset.related_channel_configurations.all(),
            "admin:acquisition_channelconfiguration_change",
        )

    @admin.display(description="Spectrogram analysis")
    def show_spectrogram_analysis(self, dataset: Dataset) -> str:
        """show_channel_configuration"""
        return get_edit_links_for_queryset(
            dataset.spectrogram_analysis.all(),
            "admin:api_spectrogramanalysis_change",
        )
