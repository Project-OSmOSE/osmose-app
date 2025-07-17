"""API annotation annotation campaign administration"""
from django.contrib import admin
from django.contrib import messages
from django.utils.html import html_safe

from backend.api.models import AnnotationCampaign
from backend.utils.admin import get_many_to_many
from ..common import IsArchivedFilter


@admin.register(AnnotationCampaign)
class AnnotationCampaignAdmin(admin.ModelAdmin):
    """AnnotationCampaign presentation in DjangoAdmin"""

    readonly_fields = ("archive",)

    list_display = (
        "id",
        "name",
        "description",
        "created_at",
        "archive",
        "instructions_url",
        "deadline",
        "label_set",
        "get_labels_with_acoustic_features",
        "allow_point_annotation",
        "owner",
        "show_spectrogram_analysis",
        "dataset",
        "confidence_set",
        "image_tuning",
        "colormap_tuning",
    )

    search_fields = (
        "name",
        "dataset__name",
    )

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

    @admin.display(description="Labels for acoustic features")
    def get_labels_with_acoustic_features(self, obj: AnnotationCampaign):
        """show_labels_with_acoustic_features"""
        return get_many_to_many(obj, "labels_with_acoustic_features", "name")

    @admin.display(description="Spectrogram analysis")
    def show_spectrogram_analysis(self, obj: AnnotationCampaign):
        """show_spectro_configs"""
        return get_many_to_many(obj, "analysis", "name")

    @admin.display(description="Image tuning")
    def image_tuning(self, obj: AnnotationCampaign):
        """image_tuning information"""
        return obj.allow_image_tuning

    @admin.display(description="Colormap tuning")
    def colormap_tuning(self, obj: AnnotationCampaign):
        """colormap_tuning information"""
        if obj.allow_colormap_tuning:
            inverted = "(inverted)" if obj.colormap_inverted_default else ""
            return html_safe(
                f"""{obj.allow_colormap_tuning}<br/>{obj.colormap_default} {inverted}"""
            )
        return obj.allow_colormap_tuning
