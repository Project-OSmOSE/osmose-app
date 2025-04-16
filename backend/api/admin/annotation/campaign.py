"""Campaign admin model"""
from django.contrib import admin
from django.contrib import messages

from backend.api.models import AnnotationCampaign, AnnotationCampaignPhase
from ..__utils__ import get_many_to_many


class IsArchivedFilter(admin.SimpleListFilter):
    """Filter archived campaign"""

    title = "Is archived"
    parameter_name = "is_archived"

    def lookups(self, request, model_admin):
        return (
            ("Yes", "Yes"),
            ("No", "No"),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == "Yes":
            return queryset.filter(archive__isnull=False)
        if value == "No":
            return queryset.filter(archive__isnull=True)
        return queryset


@admin.register(AnnotationCampaignPhase)
class AnnotationCampaignPhaseAdmin(admin.ModelAdmin):
    """AnnotationCampaignPhase presentation in DjangoAdmin"""

    list_display = (
        "id",
        "annotation_campaign",
        "show_phase",
        "show_creation",
        "show_end",
    )
    search_fields = ("annotation_campaign__name",)
    list_filter = ("phase",)

    @admin.display(description="Phase")
    def show_phase(self, phase: AnnotationCampaignPhase):
        """Display phase"""
        if phase.phase:
            return AnnotationCampaignPhase.Phase(phase.phase).label
        return None

    @admin.display(description="start")
    def show_creation(self, phase: AnnotationCampaignPhase):
        """Display creation info"""
        return f"{phase.created_at.date()} by {phase.created_by}"

    @admin.display(description="end")
    def show_end(self, phase: AnnotationCampaignPhase):
        """Display end info"""
        if phase.is_open:
            return "-"
        return f"{phase.ended_at.date()} by {phase.ended_by}"


@admin.register(AnnotationCampaign)
class AnnotationCampaignAdmin(admin.ModelAdmin):
    """AnnotationCampaign presentation in DjangoAdmin"""

    readonly_fields = ("archive",)
    # pylint: disable=R0801
    list_display = (
        "name",
        "desc",
        "created_at",
        "show_phases",
        "archive",
        "instructions_url",
        "deadline",
        "label_set",
        "show_labels_with_acoustic_features",
        "allow_point_annotation",
        "annotation_scope",
        "owner",
        "show_spectro_configs",
        "show_datasets",
        "confidence_indicator_set",
    )
    search_fields = ("name", "desc", "datasets__name")

    list_filter = (
        "phases__phase",
        IsArchivedFilter,
        "allow_point_annotation",
    )

    actions = [
        "archive",
        "unarchive",
    ]

    @admin.action(description="Archive")
    # pylint: disable-next=unused-argument
    def archive(self, request, queryset):
        """Hide selected collaborators on HomePage"""
        archived_campaigns = []
        campaign: AnnotationCampaign
        for campaign in queryset:
            if campaign.archive is None:
                campaign.do_archive(request.user)
            else:
                archived_campaigns.append(campaign.name)
        if len(archived_campaigns) > 0:
            messages.warning(
                request,
                f"The following campaigns were already archived: {', '.join(archived_campaigns)}",
            )

    @admin.action(description="/!\\ Unarchive /!\\")
    # pylint: disable-next=unused-argument
    def unarchive(self, request, queryset):
        """Hide selected collaborators on HomePage"""
        not_archived_campaigns = []
        unarchived_campaigns = []
        campaign: AnnotationCampaign
        for campaign in queryset:
            if campaign.archive is not None:
                campaign.archive.delete()
                unarchived_campaigns.append(campaign.name)
            else:
                not_archived_campaigns.append(campaign.name)
        if len(unarchived_campaigns) > 0:
            messages.error(
                request,
                f"Be careful, the dataset files of the unarchived campaigns may no longer exists:"
                f" {', '.join(unarchived_campaigns)}",
            )
        if len(not_archived_campaigns) > 0:
            messages.warning(
                request,
                f"The following campaigns were not archived: {', '.join(not_archived_campaigns)}",
            )

    @admin.display(description="Phases")
    def show_phases(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "phases", "phase")

    @admin.display(description="Spectrogram configurations")
    def show_spectro_configs(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "spectro_configs", "name")

    @admin.display(description="Datasets")
    def show_datasets(self, obj):
        """show_datasets"""
        return get_many_to_many(obj, "datasets", "name")

    @admin.display(description="Labels for acoustic features")
    def show_labels_with_acoustic_features(self, obj):
        """show_labels_with_acoustic_features"""
        return get_many_to_many(obj, "labels_with_acoustic_features", "name")

    @admin.display(description="Is archived")
    def is_archived(self, campaign: AnnotationCampaign) -> bool:
        """is_archived"""
        return campaign.archive is not None
