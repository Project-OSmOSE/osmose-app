"""Annotation campaign DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method
from django.db.models import Count

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field
from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignUsage,
)
from backend.api.serializers.confidence_indicator_set import (
    ConfidenceIndicatorSetSerializer,
)
from backend.api.serializers.annotation_set import AnnotationSetSerializer
from .utils import EnumField


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
    annotation_set_name = serializers.CharField()
    mode = EnumField(enum=AnnotationCampaignUsage, source="usage")

    class Meta:
        model = AnnotationCampaign
        # pylint:disable=duplicate-code
        fields = [
            "id",
            "name",
            "desc",
            "instructions_url",
            "start",
            "end",
            "annotation_set_name",
            "confidence_indicator_set_name",
            "user_tasks_count",
            "complete_tasks_count",
            "user_complete_tasks_count",
            "files_count",
            "mode",
            "created_at",
        ]


class AnnotationCampaignRetrieveAuxCampaignSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output AnnotationCampaign basic data used in AnnotationCampaignRetrieveSerializer
    """

    annotation_set = AnnotationSetSerializer()
    confidence_indicator_set = ConfidenceIndicatorSetSerializer()
    dataset_files_count = serializers.SerializerMethodField()

    class Meta:
        model = AnnotationCampaign
        fields = [
            "id",
            "name",
            "desc",
            "instructions_url",
            "start",
            "end",
            "annotation_set",
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
