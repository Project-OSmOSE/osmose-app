"""Annotation campaign list/retrieve serializer"""
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignUsage,
    AnnotationTask,
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


class AnnotationCampaignBasicSerializer(serializers.ModelSerializer):
    """Serializer for annotation file range"""

    files_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = AnnotationCampaign
        exclude = ("created_at", "spectro_configs", "annotators")


class AnnotationCampaignListSerializer(serializers.ModelSerializer):
    """Serialize Annotation campaign list"""

    datasets_name = serializers.ListSerializer(
        read_only=True, child=serializers.CharField()
    )
    is_mine = serializers.BooleanField(read_only=True)
    is_archived = serializers.BooleanField(read_only=True)
    my_progress = serializers.SerializerMethodField(read_only=True)
    my_total = serializers.IntegerField(read_only=True)
    progress = serializers.SerializerMethodField(read_only=True)
    total = serializers.IntegerField(read_only=True)
    usage = EnumField(enum=AnnotationCampaignUsage)

    class Meta:
        model = AnnotationCampaign
        fields = [
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

    def get_progress(self, campaign: AnnotationCampaign) -> int:
        """Get progress"""
        return campaign.tasks.filter(status=AnnotationTask.Status.FINISHED).count()

    def get_my_progress(self, campaign: AnnotationCampaign) -> int:
        """Get current user progress"""
        return campaign.tasks.filter(
            annotator_id=self.context["user_id"], status=AnnotationTask.Status.FINISHED
        ).count()
