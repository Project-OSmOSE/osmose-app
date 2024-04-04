"""Campaign admin model"""
from django.contrib import admin

from backend.api.models import AnnotationCampaign
from ..__utils__ import get_many_to_many


class IsArchivedFilter(admin.SimpleListFilter):
    title = "Is archived"
    parameter_name = "is_archived"

    def lookups(self, request, model_admin):
        return (
            ('Yes', 'Yes'),
            ('No', 'No'),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == 'Yes':
            return queryset.filter(archived_date__isnull=False)
        elif value == 'No':
            return queryset.filter(archived_date__isnull=True)
        return queryset


class AnnotationCampaignAdmin(admin.ModelAdmin):
    """AnnotationCampaign presentation in DjangoAdmin"""

    list_display = (
        "name",
        "desc",
        "created_at",
        "is_archived",
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
        "usage",
    )
    search_fields = ("name", "desc")

    list_filter = ("datasets", "usage", IsArchivedFilter)

    def show_spectro_configs(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "spectro_configs", "name")

    def show_datasets(self, obj):
        """show_datasets"""
        return get_many_to_many(obj, "datasets", "name")

    def show_annotators(self, obj):
        """show_annotators"""
        return get_many_to_many(obj, "annotators", "username")

    def is_archived(self, campaign: AnnotationCampaign) -> bool:
        """is_archived"""
        return campaign.archived_date is not None


