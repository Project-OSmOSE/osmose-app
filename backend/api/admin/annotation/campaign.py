"""Campaign admin model"""
from django.contrib import admin
from django.contrib import messages

from backend.api.models import AnnotationCampaign, AnnotationCampaignArchive
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
        for campaign in queryset:
            print(campaign, campaign.archive)
        if value == "Yes":
            return queryset.filter(archive__isnull=False)
        if value == "No":
            return queryset.filter(archive__isnull=True)
        return queryset


@admin.register(AnnotationCampaign)
class AnnotationCampaignAdmin(admin.ModelAdmin):
    """AnnotationCampaign presentation in DjangoAdmin"""

    readonly_fields = ("archive",)
    # pylint: disable=R0801
    list_display = (
        "name",
        "desc",
        "created_at",
        "archive",
        "instructions_url",
        "deadline",
        "label_set",
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

    @admin.action(description="/!\ Unarchive /!\\")
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
        print(
            campaign.archive,
            AnnotationCampaignArchive.objects.filter(campaign=campaign),
        )
        return campaign.archive is not None
