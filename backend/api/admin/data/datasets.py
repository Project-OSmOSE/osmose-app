"""Dataset related administration classes"""
from django.contrib import admin
from django.core.handlers.wsgi import WSGIRequest
from django.db.models import QuerySet
from django.http import JsonResponse
from django.urls import reverse
from django.utils.html import format_html

from backend.api.models import DatasetType, Dataset, DatasetFile
from backend.utils.serializers import SimpleSerializer


@admin.register(DatasetType)
class DatasetTypeAdmin(admin.ModelAdmin):
    """DatasetType presentation in DjangoAdmin"""

    list_display = ("name", "desc")


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    """Dataset presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "show_channel_configuration",
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
    search_fields = ("name", "related_channel_configuration__deployment__name")
    fields = (
        "name",
        "desc",
        "related_channel_configuration",
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
    filter_horizontal = ("related_channel_configuration",)

    actions = [
        "export",
    ]

    @admin.display(description="Metadatax channel configurations")
    def show_channel_configuration(self, dataset: Dataset) -> str:
        """show_channel_configuration"""
        return format_html(
            "<br>".join(
                [
                    str(channel)
                    for channel in dataset.related_channel_configuration.all()
                ]
            )
        )

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
        if obj.audio_metadatum is None:
            return "-"
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


@admin.register(DatasetFile)
class DatasetFileAdmin(admin.ModelAdmin):
    """DatasetFile presentation in DjangoAdmin"""

    list_display = (
        "id",
        "filename",
        "filepath",
        "size",
        "dataset",
        "start",
        "end",
    )
    search_fields = ("dataset__name",)
