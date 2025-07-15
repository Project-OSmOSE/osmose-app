"""Spectrogram admin configuration"""
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from backend.api.models import WindowType, SpectrogramConfiguration


@admin.register(WindowType)
class WindowTypeAdmin(admin.ModelAdmin):
    """WindowType presentation in DjangoAdmin"""

    list_display = ("name",)


@admin.register(SpectrogramConfiguration)
class SpectrogramConfigurationAdmin(admin.ModelAdmin):
    """SpectrogramConfiguration presentation in DjangoAdmin"""

    list_display = (
        "name",
        "dataset",
        "desc",
        "nfft",
        "window_size",
        "overlap",
        "zoom_level",
        "desc",
        "spectro_normalization",
        "data_normalization",
        "zscore_duration",
        "hp_filter_min_freq",
        "colormap",
        "dynamic",
        "link_to_window_type",
        "frequency_resolution",
        "temporal_resolution",
        "sensitivity_dB",
        "spectro_duration",
        "peak_voltage",
        "gain_dB",
        "audio_file_dataset_overlap",
        "time_resolution_zoom_0",
        "time_resolution_zoom_1",
        "time_resolution_zoom_2",
        "time_resolution_zoom_3",
        "time_resolution_zoom_4",
        "time_resolution_zoom_5",
        "time_resolution_zoom_6",
        "time_resolution_zoom_7",
        "time_resolution_zoom_8",
        "linear_frequency_scale",
        "multi_linear_frequency_scale",
    )

    def dynamic(self, obj: SpectrogramConfiguration) -> str:
        """Get dynamic min and max in one field"""
        return f"{obj.dynamic_min} - {obj.dynamic_max}"

    @admin.display(description="Window type")
    def link_to_window_type(self, obj: SpectrogramConfiguration) -> str:
        """Get direct link to window type"""
        link = reverse("admin:api_windowtype_change", args=[obj.window_type_id])
        return format_html('<a href="{}">{}</a>', link, obj.window_type)
