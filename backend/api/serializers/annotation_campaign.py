"""Annotation campaign DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method
from django.db.models import Count

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field
from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignUsage,
    AnnotationCampaignArchive,
)
from backend.api.serializers.confidence_indicator_set import (
    ConfidenceIndicatorSetSerializer,
)
from backend.api.serializers.label_set import LabelSetSerializer
from .utils import EnumField
from .user import UserSerializer


class AnnotationCampaignListSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output list of AnnotationCampaigns augmented data

    This serializer expects to be used on AnnotationCampaigns that have had prefetched data on tasks using the right
    attr_names
    """

    user_tasks_count = serializers.IntegerField()
    complete_tasks_count = serializers.IntegerField()
    user_complete_tasks_count = serializers.IntegerField()
    files_count = serializers.IntegerField()
    confidence_indicator_set_name = serializers.CharField()
    label_set_name = serializers.CharField()
    mode = EnumField(enum=AnnotationCampaignUsage, source="usage")

    class Meta:
        model = AnnotationCampaign
        # pylint:disable=duplicate-code
        fields = [
            "id",
            "name",
            "desc",
            "instructions_url",
            "deadline",
            "label_set_name",
            "confidence_indicator_set_name",
            "user_tasks_count",
            "complete_tasks_count",
            "user_complete_tasks_count",
            "files_count",
            "mode",
            "created_at",
        ]


class AnnotationCampaignArchiveSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output AnnotationCampaignArchive basic data
    """

    by_user = UserSerializer()

    class Meta:
        model = AnnotationCampaignArchive
        fields = ["date", "by_user"]


class AnnotationCampaignRetrieveAuxCampaignSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output AnnotationCampaign basic data used in AnnotationCampaignRetrieveSerializer
    """

    label_set = LabelSetSerializer()
    confidence_indicator_set = ConfidenceIndicatorSetSerializer()
    dataset_files_count = serializers.SerializerMethodField()
    archive = AnnotationCampaignArchiveSerializer()

    class Meta:
        model = AnnotationCampaign
        # pylint: disable=R0801
        fields = [
            "id",
            "name",
            "desc",
            "archive",
            "instructions_url",
            "deadline",
            "label_set",
            "confidence_indicator_set",
            "datasets",
            "created_at",
            "usage",
            "dataset_files_count",
        ]

    @extend_schema_field(serializers.IntegerField)
    def get_dataset_files_count(self, campaign):
        # type: (AnnotationCampaign) -> int
        return sum(
            campaign.datasets.annotate(Count("files")).values_list(
                "files__count", flat=True
            )
        )


class AnnotationCampaignRetrieveAuxTaskSerializer(serializers.Serializer):
    """
    Serializer meant to output AnnotationTask basic data used in AnnotationCampaignRetrieveSerializer
    """

    status = serializers.IntegerField()
    annotator_id = serializers.IntegerField()
    count = serializers.IntegerField()


class AnnotationCampaignRetrieveSerializer(serializers.Serializer):
    """Serializer meant to output AnnotationCampaign data augmented with tasks data"""

    campaign = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()
    is_campaign_owner = serializers.SerializerMethodField("_is_campaign_owner")

    @extend_schema_field(AnnotationCampaignRetrieveAuxCampaignSerializer)
    def get_campaign(self, campaign):
        return AnnotationCampaignRetrieveAuxCampaignSerializer(campaign).data

    @extend_schema_field(AnnotationCampaignRetrieveAuxTaskSerializer(many=True))
    def get_tasks(self, campaign):
        return list(
            campaign.tasks.values("status", "annotator_id").annotate(
                count=Count("status")
            )
        )

    def _is_campaign_owner(self, campaign: AnnotationCampaign):
        """Get information about current user ownership of this campaign"""
        return campaign.owner_id == self.context.get("user_id")
