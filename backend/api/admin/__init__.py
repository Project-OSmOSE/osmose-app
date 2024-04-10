"""Python module for Django admin interface"""
# Python admin has too many false-positives on the following warnings:
# pylint: disable=too-many-function-args, R0801

from django import forms
from django.contrib import admin, messages
from django.db import IntegrityError, transaction
from django.utils.html import format_html

from backend.api.models import (
    Dataset,
    DatasetFile,
    LabelSet,
    Label,
    AnnotationTask,
    AnnotationComment,
    AnnotationSession,
    SpectroConfig,
    DatasetType,
    AudioMetadatum,
    GeoMetadatum,
    WindowType,
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
)
from .__utils__ import get_many_to_many
from .annotation import (
    DetectorAdmin,
    DetectorConfigurationAdmin,
    AnnotationResultAdmin,
    AnnotationResultValidationAdmin,
)


class NewItemsForm(forms.ModelForm):
    """NewItem need a textarea form for intro field for UX"""

    intro = forms.CharField(widget=forms.Textarea)


class ConfidenceIndicatorAdmin(admin.ModelAdmin):
    """ConfidenceIndicatorAdmin presentation in DjangoAdmin"""

    list_display = (
        "id",
        "label",
        "level",
        "confidence_indicator_set",
        "is_default",
    )

    def save_model(self, request, obj, form, change):
        try:
            with transaction.atomic():
                super().save_model(request, obj, form, change)
        except IntegrityError as error:
            messages.set_level(request, messages.ERROR)
            messages.error(request, error)


class ConfidenceIndicatorSetAdmin(admin.ModelAdmin):
    """ConfidenceIndicatorSet presentation in DjangoAdmin"""

    list_display = (
        "id",
        "name",
        "desc",
    )


class DatasetTypeAdmin(admin.ModelAdmin):
    """DatasetType presentation in DjangoAdmin"""

    list_display = ("name", "desc")


class DatasetAdmin(admin.ModelAdmin):
    """Dataset presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "created_at",
        "dataset_path",
        "dataset_conf",
        "status",
        "files_type",
        "start_date",
        "end_date",
        "show_audio_metadatum_url",
        "dataset_type",
        "geo_metadatum",
        "owner",
        "show_spectro_configs",
    )
    fields = (
        "name",
        "desc",
        "dataset_path",
        "dataset_conf",
        "status",
        "files_type",
        "start_date",
        "end_date",
        "dataset_type",
        "geo_metadatum",
        "owner",
    )

    def show_spectro_configs(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "spectro_configs")

    def show_audio_metadatum_url(self, obj):
        """show_audio_metadatum_url"""
        return format_html(
            "<a href='/backend/admin/api/audiometadatum/{id}/change/'>{metadatum}</a>",
            id=obj.audio_metadatum.id,
            metadatum=obj.audio_metadatum,
        )


class DatasetFileAdmin(admin.ModelAdmin):
    """DatasetFile presentation in DjangoAdmin"""

    list_display = (
        "filename",
        "filepath",
        "size",
        "dataset",
        "audio_metadatum",
    )


class LabelAdmin(admin.ModelAdmin):
    """Label presentation in DjangoAdmin"""

    list_display = ["name"]


class LabelSetAdmin(admin.ModelAdmin):
    """LabelSet presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "show_labels",
    )

    def show_labels(self, obj):
        """show_labels"""
        return get_many_to_many(obj, "labels", "name")


class AnnotationCommentAdmin(admin.ModelAdmin):
    """AnnotationComment presentation in DjangoAdmin"""

    list_display = (
        "id",
        "comment",
    )


class AnnotationTaskAdmin(admin.ModelAdmin):
    """AnnotationTask presentation in DjangoAdmin"""

    list_display = (
        "status",
        "annotation_campaign",
        "dataset_file",
        "annotator",
    )
    search_fields = ("dataset_file__filename",)
    list_filter = ("status", "annotation_campaign", "annotator")


class AnnotationSessionAdmin(admin.ModelAdmin):
    """AnnotationSession presentation in DjangoAdmin"""

    list_display = (
        "start",
        "end",
        "session_output",
        "annotation_task",
    )


class AudioMetadatumAdmin(admin.ModelAdmin):
    """AudioMetadatum presentation in DjangoAdmin"""

    list_display = (
        "start",
        "end",
        "channel_count",
        "dataset_sr",
        "total_samples",
        "sample_bits",
        "gain_db",
        "gain_rel",
        "dutycycle_rdm",
        "dutycycle_rim",
    )


class GeoMetadatumAdmin(admin.ModelAdmin):
    """GeoMetadatum presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "location",
        "region",
    )


class WindowTypeAdmin(admin.ModelAdmin):
    """WindowType presentation in DjangoAdmin"""

    list_display = ("name",)


class SpectroConfigAdmin(admin.ModelAdmin):
    """SpectroConfig presentation in DjangoAdmin"""

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
        "dynamic_min",
        "dynamic_max",
        "window_type",
        "frequency_resolution",
        "time_resolution_zoom_0",
        "time_resolution_zoom_1",
        "time_resolution_zoom_2",
        "time_resolution_zoom_3",
        "time_resolution_zoom_4",
        "time_resolution_zoom_5",
        "time_resolution_zoom_6",
        "time_resolution_zoom_7",
        "time_resolution_zoom_8",
    )


admin.site.register(ConfidenceIndicator, ConfidenceIndicatorAdmin)
admin.site.register(ConfidenceIndicatorSet, ConfidenceIndicatorSetAdmin)
admin.site.register(DatasetType, DatasetTypeAdmin)
admin.site.register(Dataset, DatasetAdmin)
admin.site.register(DatasetFile, DatasetFileAdmin)
admin.site.register(Label, LabelAdmin)
admin.site.register(LabelSet, LabelSetAdmin)
admin.site.register(AnnotationComment, AnnotationCommentAdmin)
admin.site.register(AnnotationTask, AnnotationTaskAdmin)
admin.site.register(AnnotationSession, AnnotationSessionAdmin)
admin.site.register(AudioMetadatum, AudioMetadatumAdmin)
admin.site.register(GeoMetadatum, GeoMetadatumAdmin)
admin.site.register(SpectroConfig, SpectroConfigAdmin)
admin.site.register(WindowType, WindowTypeAdmin)
