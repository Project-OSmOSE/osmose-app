"""Annotation campaign list/retrieve serializer"""
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignUsage,
)
from backend.utils.serializers import EnumField

AnnotationCampaignListFields = [
    "id",
    "name",
    "deadline",
    "datasets_name",
    "is_mine",
    "is_archived",
    "my_progress",
    "my_total",
    "progress",
    "total",
    "usage",
]


class AnnotationCampaignListSerializer(serializers.ModelSerializer):
    """Serialize Annotation campaign list"""

    datasets_name = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    is_archived = serializers.SerializerMethodField()
    my_progress = serializers.IntegerField()
    my_total = serializers.IntegerField()
    progress = serializers.IntegerField()
    total = serializers.IntegerField()
    usage = EnumField(enum=AnnotationCampaignUsage)

    class Meta:
        model = AnnotationCampaign
        fields = AnnotationCampaignListFields

    def get_datasets_name(self, campaign: AnnotationCampaign) -> list[str]:
        """Get datasets name"""
        return campaign.datasets.values_list("name")

    def get_is_mine(self, campaign: AnnotationCampaign) -> bool:
        """Defined either the campaign is owned by the context user"""
        return campaign.owner_id == self.context["user_id"]

    def get_is_archived(self, campaign: AnnotationCampaign) -> bool:
        """Defined either the campaign is archived"""
        return campaign.archive_id is not None
