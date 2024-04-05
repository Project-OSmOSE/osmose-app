"""Annotation campaign list/retrieve serializer"""
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
)

AnnotationCampaignListFields = [
    "id",
    "name",
    "deadline",
    "datasets_name",
    "is_mine",
    "my_progress",
    "my_total",
    "progress",
    "total",
]


class AnnotationCampaignListSerializer(serializers.ModelSerializer):
    """Serialize Annotation campaign list"""

    datasets_name = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    my_progress = serializers.IntegerField()
    my_total = serializers.IntegerField()
    progress = serializers.IntegerField()
    total = serializers.IntegerField()

    class Meta:
        model = AnnotationCampaign
        fields = AnnotationCampaignListFields

    def get_datasets_name(self, campaign: AnnotationCampaign) -> list[str]:
        """Get datasets name"""
        return campaign.datasets.values_list("name")

    def get_is_mine(self, campaign: AnnotationCampaign) -> bool:
        """Defined either the campaign is owned by the context user"""
        return campaign.owner_id == self.context["user_id"]
