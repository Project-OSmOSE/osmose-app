"""Python module for Django admin interface"""
# Python admin has too many false-positives on the following warnings:
# pylint: disable=too-many-function-args, R0801
from collections import OrderedDict
from django.contrib import admin

from backend.api.models import (
    Dataset,
    DatasetFile,
    AnnotationSet,
    AnnotationTag,
    AnnotationCampaign,
    AnnotationTask,
    AnnotationResult,
    AnnotationSession,
    SpectroConfig,
    DatasetType,
    AudioMetadatum,
    GeoMetadatum,
    WindowType,
    News,
)


def get_many_to_many(obj, field_name, related_field_name="name"):
    """List all related field

    Args:
        obj (object): _description_
        field_name (string): _description_
        related_field_name (str, optional): _description_. Defaults to "name".

    Returns:
        string: _description_
    """
    field_name_attr = getattr(obj, field_name)
    many_to_many_attributs = ""
    for one_name_attr in field_name_attr.all():
        name_field = getattr(one_name_attr, related_field_name)
        many_to_many_attributs += f"{name_field}, "

    return " ".join(OrderedDict.fromkeys(many_to_many_attributs.split()))


class CollectionAdmin(admin.ModelAdmin):
    """Collection presentation in DjangoAdmin"""

    list_display = ("name", "desc", "owner")


class DatasetTypeAdmin(admin.ModelAdmin):
    """DatasetType presentation in DjangoAdmin"""

    list_display = ("name", "desc")


class DatasetAdmin(admin.ModelAdmin):
    """Dataset presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "dataset_path",
        "dataset_conf",
        "status",
        "files_type",
        "start_date",
        "end_date",
        "audio_metadatum",
        "dataset_type",
        "geo_metadatum",
        "owner",
        "tabular_metadatum",
        "show_collections",
        "show_spectro_configs",
    )

    def show_collections(self, obj):
        """show_collections"""
        return get_many_to_many(obj, "collections")

    def show_spectro_configs(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "spectro_configs")


class DatasetFileAdmin(admin.ModelAdmin):
    """DatasetFile presentation in DjangoAdmin"""

    list_display = (
        "filename",
        "filepath",
        "size",
        "dataset",
        "audio_metadatum",
        "tabular_metadatum",
    )


class AnnotationTagAdmin(admin.ModelAdmin):
    """AnnotationTag presentation in DjangoAdmin"""

    list_display = ["name"]


class AnnotationSetAdmin(admin.ModelAdmin):
    """AnnotationSet presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "owner",
        "show_tags",
    )

    def show_tags(self, obj):
        """show_tags"""
        return get_many_to_many(obj, "tags", "name")


class AnnotationCampaignAdmin(admin.ModelAdmin):
    """AnnotationCampaign presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "instructions_url",
        "start",
        "end",
        "annotation_set",
        "annotation_scope",
        "owner",
        "show_spectro_configs",
        "show_datasets",
        "show_annotators",
    )

    def show_spectro_configs(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "spectro_configs", "name")

    def show_datasets(self, obj):
        """show_datasets"""
        return get_many_to_many(obj, "datasets", "name")

    def show_annotators(self, obj):
        """show_annotators"""
        return get_many_to_many(obj, "annotators", "username")


class AnnotationTaskAdmin(admin.ModelAdmin):
    """AnnotationTask presentation in DjangoAdmin"""

    list_display = (
        "status",
        "annotation_campaign",
        "dataset_file",
        "annotator_id",
    )


class AnnotationResultAdmin(admin.ModelAdmin):
    """AnnotationResult presentation in DjangoAdmin"""

    list_display = (
        "start_time",
        "end_time",
        "start_frequency",
        "end_frequency",
        "annotation_tag",
        "annotation_task",
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


class WindowTypeAdmin(admin.ModelAdmin):
    """WindowType presentation in DjangoAdmin"""

    list_display = ("name",)


class SpectroConfigAdmin(admin.ModelAdmin):
    """SpectroConfig presentation in DjangoAdmin"""

    list_display = (
        "name",
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


class TabularMetadatumAdmin(admin.ModelAdmin):
    """TabularMetadatum presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "dimension_count",
        "variable_count",
    )


class TabularMetadataVariableAdmin(admin.ModelAdmin):
    """TabularMetadataVariable presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "data_type",
        "dimension_size",
        "variable_position",
        "tabular_metadata",
    )


class TabularMetadataShapeAdmin(admin.ModelAdmin):
    """TabularMetadataShape presentation in DjangoAdmin"""

    list_display = (
        "dimension_position",
        "tabular_metadata_dimension",
        "tabular_metadata_variable",
    )

class NewItemsAdmin(admin.ModelAdmin):
    """News presentation in DjangoAdmin"""

    list_display = (
        "title","body"
    )

admin.site.register(DatasetType, DatasetTypeAdmin)
admin.site.register(Dataset, DatasetAdmin)
admin.site.register(DatasetFile, DatasetFileAdmin)
admin.site.register(AnnotationTag, AnnotationTagAdmin)
admin.site.register(AnnotationSet, AnnotationSetAdmin)
admin.site.register(AnnotationCampaign, AnnotationCampaignAdmin)
admin.site.register(AnnotationTask, AnnotationTaskAdmin)
admin.site.register(AnnotationResult, AnnotationResultAdmin)
admin.site.register(AnnotationSession, AnnotationSessionAdmin)
admin.site.register(AudioMetadatum, AudioMetadatumAdmin)
admin.site.register(GeoMetadatum, GeoMetadatumAdmin)
admin.site.register(SpectroConfig, SpectroConfigAdmin)
admin.site.register(WindowType, WindowTypeAdmin)
admin.site.register(News, NewItemsAdmin)


# admin.site.register(Collection, CollectionAdmin)
# admin.site.register(TabularMetadatum, TabularMetadatumAdmin)
# admin.site.register(TabularMetadataVariable, TabularMetadataVariableAdmin)
# admin.site.register(TabularMetadataShape, TabularMetadataShapeAdmin)
