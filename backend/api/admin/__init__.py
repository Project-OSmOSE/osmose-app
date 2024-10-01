"""Python module for Django admin interface"""
# Python admin has too many false-positives on the following warnings:
# pylint: disable=too-many-function-args, R0801

from django import forms
from django.contrib import admin, messages
from django.core.handlers.wsgi import WSGIRequest
from django.db import IntegrityError, transaction
from django.db.models import QuerySet
from django.http import JsonResponse
from django.urls import reverse
from django.utils.html import format_html

from backend.api.models import (
    Dataset,
    DatasetFile,
    LabelSet,
    Label,
    AnnotationComment,
    AnnotationSession,
    DatasetType,
    AudioMetadatum,
    GeoMetadatum,
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
)
from .__utils__ import get_many_to_many
from .annotation import (
    DetectorAdmin,
    DetectorConfigurationAdmin,
    AnnotationResultAdmin,
    AnnotationResultValidationAdmin,
    AnnotationTaskAdmin,
)
from .spectrogram import (
    MultiLinearScaleAdmin,
    LinearScaleAdmin,
    SpectrogramConfigurationAdmin,
    WindowTypeAdmin,
)
from ..serializers.dataset import SimpleSerializer


class NewItemsForm(forms.ModelForm):
    """NewItem need a textarea form for intro field for UX"""

    intro = forms.CharField(widget=forms.Textarea)


class ConfidenceIndicatorAdmin(admin.ModelAdmin):
    """ConfidenceIndicator presentation in DjangoAdmin"""

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

    actions = [
        "export",
    ]

    @admin.display(description="Spectrogram configurations")
    def show_spectro_configs(self, dataset: Dataset) -> str:
        """show_spectro_configs"""
        links = []
        for spectro in dataset.spectro_configs.all():
            link = reverse(
                "admin:api_spectrogramconfiguration_change", args=[spectro.id]
            )
            links.append(format_html('<a href="{}">{}</a>', link, spectro))
        return format_html("<br>".join(links))

    @admin.display(description="Audio metadata")
    def show_audio_metadatum_url(self, obj):
        """show_audio_metadatum_url"""
        return format_html(
            "<a href='/backend/admin/api/audiometadatum/{id}/change/'>{metadatum}</a>",
            id=obj.audio_metadatum.id,
            metadatum=obj.audio_metadatum,
        )

    @admin.action(description="Download data as JSON")
    def export(self, request: WSGIRequest, queryset: QuerySet[Dataset]):
        """WIP"""
        SimpleSerializer.Meta.model = Dataset
        serializer = SimpleSerializer(data=queryset, many=True)
        serializer.is_valid()
        response = JsonResponse(data=serializer.data, safe=False)
        response["Content-Disposition"] = 'attachment; filename="APLOSE_datasets.json"'
        return response


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


admin.site.register(ConfidenceIndicator, ConfidenceIndicatorAdmin)
admin.site.register(ConfidenceIndicatorSet, ConfidenceIndicatorSetAdmin)
admin.site.register(DatasetType, DatasetTypeAdmin)
admin.site.register(Dataset, DatasetAdmin)
admin.site.register(DatasetFile, DatasetFileAdmin)
admin.site.register(Label, LabelAdmin)
admin.site.register(LabelSet, LabelSetAdmin)
admin.site.register(AnnotationComment, AnnotationCommentAdmin)
admin.site.register(AnnotationSession, AnnotationSessionAdmin)
admin.site.register(AudioMetadatum, AudioMetadatumAdmin)
admin.site.register(GeoMetadatum, GeoMetadatumAdmin)
