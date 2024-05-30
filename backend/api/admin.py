"""Python module for Django admin interface"""
# Python admin has too many false-positives on the following warnings:
# pylint: disable=too-many-function-args, R0801

from django import forms
from django.contrib import admin
from django.contrib import messages
from django.contrib.admin import sites
from django.db import IntegrityError, transaction
from django.utils.html import format_html

from backend.api.models import (
    Dataset,
    DatasetFile,
    AnnotationSet,
    AnnotationTag,
    AnnotationCampaign,
    AnnotationTask,
    AnnotationComment,
    AnnotationResult,
    AnnotationSession,
    SpectroConfig,
    DatasetType,
    AudioMetadatum,
    GeoMetadatum,
    WindowType,
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
)


class AploseAdminSite(admin.AdminSite):
    """Update Django admin display"""

    app_ordering = {"api": 1, "metadatax": 2, "auth": 2, "osmosewebsite": 2}
    metadatax_ordering = {
        "> Map": 0,
        "Institutions": 1,
        "Projects": 2,
        "Deployments": 3,
        "Channel configurations": 4,
        "Files": 5,
        "Equipment - Recorders": 10,
        "Equipment - Hydrophones": 11,
    }

    def _build_app_dict(self, request, label=None):
        # we create manually a dict to fake a model for our view 'map'
        map_fake_model = {
            "name": "> Map",
            "admin_url": "/map/",
            "object_name": "Map",
            "perms": {"delete": False, "add": False, "change": False},
            "add_url": "",
        }

        # get the app dict from the parent method
        app_dict = super()._build_app_dict(request, label)
        # check if there is value for label = admin view for specific app
        if label:
            app_dict["models"] = [
                m
                for m in app_dict["models"]
                if m["name"] in list(self.metadatax_ordering)
            ]
            app_dict["models"].append(map_fake_model)

        # otherwise = home admin view with all apps
        else:
            app = app_dict.get("metadatax", None)
            if app:
                app["models"] = [
                    m
                    for m in app["models"]
                    if m["name"] in list(self.metadatax_ordering)
                ]
                app["models"].append(map_fake_model)
                app["models"].sort(key=lambda x: self.metadatax_ordering[x["name"]])
        return app_dict

    def get_app_list(self, request):
        """
        Return a sorted list of all the installed apps that have been
        registered in this site.
        """
        app_dict = self._build_app_dict(request)
        app_list = sorted(
            app_dict.values(), key=lambda x: self.app_ordering[x["app_label"]]
        )

        return app_list


mysite = AploseAdminSite()
admin.site = mysite
sites.site = mysite


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
    for one_name_attr in field_name_attr.all().distinct():
        name_field = getattr(one_name_attr, related_field_name)
        many_to_many_attributs += f"{name_field}, "

    return many_to_many_attributs[:-2]


class NewItemsForm(forms.ModelForm):
    """NewItem need a textarea form for intro field for UX"""

    intro = forms.CharField(widget=forms.Textarea)


class ConfidenceIndicatorAdmin(admin.ModelAdmin):
    """Collection presentation in DjangoAdmin"""

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
    """Collection presentation in DjangoAdmin"""

    list_display = (
        "id",
        "name",
        "desc",
    )


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
        "tabular_metadatum",
        "show_spectro_configs",
        "show_collections",
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
        "tabular_metadatum",
        "collections",
    )

    def show_spectro_configs(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "spectro_configs")

    def show_collections(self, obj):
        """show_collections"""
        return get_many_to_many(obj, "collections")

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


class AnnotationCommentAdmin(admin.ModelAdmin):
    """AnnotationSet presentation in DjangoAdmin"""

    list_display = (
        "id",
        "comment",
        "annotation_task",
        "annotation_result",
    )


class AnnotationCampaignAdmin(admin.ModelAdmin):
    """AnnotationCampaign presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "created_at",
        "instructions_url",
        "start",
        "end",
        "annotation_set",
        "annotation_scope",
        "owner",
        "show_spectro_configs",
        "show_datasets",
        "show_annotators",
        "confidence_indicator_set",
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
    list_filter = ("status", "annotation_campaign", "annotator_id")

    def clean_duplicates(self, request, queryset):
        """Clean duplicated annotation task"""
        task: AnnotationTask
        for task in queryset.iterator():
            AnnotationTask.objects.filter(
                annotation_campaign_id=task.annotation_campaign_id,
                dataset_file_id=task.dataset_file_id,
                annotator_id=task.annotator_id,
                status=0,
                id__gt=task.id,
            ).delete()

    clean_duplicates.short_description = (
        "Clean duplicated tasks (for same annotator, "
        'campaign, dataset_file -- Only clean "created" tasks)'
    )
    clean_duplicates.acts_on_all = True
    actions = [
        clean_duplicates,
    ]


class AnnotationResultAdmin(admin.ModelAdmin):
    """AnnotationResult presentation in DjangoAdmin"""

    list_display = (
        "id",
        "start_time",
        "end_time",
        "start_frequency",
        "end_frequency",
        "annotation_tag",
        "annotation_task",
        "confidence_indicator",
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


admin.site.register(ConfidenceIndicator, ConfidenceIndicatorAdmin)
admin.site.register(ConfidenceIndicatorSet, ConfidenceIndicatorSetAdmin)
admin.site.register(DatasetType, DatasetTypeAdmin)
admin.site.register(Dataset, DatasetAdmin)
admin.site.register(DatasetFile, DatasetFileAdmin)
admin.site.register(AnnotationTag, AnnotationTagAdmin)
admin.site.register(AnnotationSet, AnnotationSetAdmin)
admin.site.register(AnnotationCampaign, AnnotationCampaignAdmin)
admin.site.register(AnnotationComment, AnnotationCommentAdmin)
admin.site.register(AnnotationTask, AnnotationTaskAdmin)
admin.site.register(AnnotationResult, AnnotationResultAdmin)
admin.site.register(AnnotationSession, AnnotationSessionAdmin)
admin.site.register(AudioMetadatum, AudioMetadatumAdmin)
admin.site.register(GeoMetadatum, GeoMetadatumAdmin)
admin.site.register(SpectroConfig, SpectroConfigAdmin)
admin.site.register(WindowType, WindowTypeAdmin)

# admin.site.register(Collection, CollectionAdmin)
# admin.site.register(TabularMetadatum, TabularMetadatumAdmin)
# admin.site.register(TabularMetadataVariable, TabularMetadataVariableAdmin)
# admin.site.register(TabularMetadataShape, TabularMetadataShapeAdmin)
