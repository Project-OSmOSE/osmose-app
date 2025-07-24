"""Python module for Django admin interface"""
# Python admin has too many false-positives on the following warnings:
# pylint: disable=too-many-function-args, R0801

from django import forms

from backend.api.models import (
    LabelSet,
    Label,
    AnnotationComment,
    AnnotationSession,
    AudioMetadatum,
    GeoMetadatum,
)
from .__utils__ import get_many_to_many
from .annotation import *
from .datasets import DatasetTypeAdmin, DatasetAdmin, DatasetFileAdmin
from .spectrogram import *


class NewItemsForm(forms.ModelForm):
    """NewItem need a textarea form for intro field for UX"""

    intro = forms.CharField(widget=forms.Textarea)


class LabelAdmin(admin.ModelAdmin):
    """Label presentation in DjangoAdmin"""

    list_display = ["name"]
    autocomplete_fields = ["metadatax_label"]


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
        "show_files_subtypes",
        "gain_db",
        "gain_rel",
        "dutycycle_rdm",
        "dutycycle_rim",
    )

    @admin.display(description="Files subtypes")
    def show_files_subtypes(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "files_subtypes", "name")


class GeoMetadatumAdmin(admin.ModelAdmin):
    """GeoMetadatum presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "location",
        "region",
    )


admin.site.register(Label, LabelAdmin)
admin.site.register(LabelSet, LabelSetAdmin)
admin.site.register(AnnotationComment, AnnotationCommentAdmin)
admin.site.register(AnnotationSession, AnnotationSessionAdmin)
admin.site.register(AudioMetadatum, AudioMetadatumAdmin)
admin.site.register(GeoMetadatum, GeoMetadatumAdmin)
