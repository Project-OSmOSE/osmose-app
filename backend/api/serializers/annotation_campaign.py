"""Annotation campaign DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method
from django.db.models import Count
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignArchive,
    AnnotationCampaignUsage,
    AudioMetadatum,
)
from backend.utils.serializers import EnumField
from .confidence_indicator_set import (
    ConfidenceIndicatorSetSerializer,
)
from .dataset import SpectrogramConfigurationSerializer, AudioMetadatumSerializer
from .label_set import LabelSetSerializer
from ...aplose_auth.serializers import UserSerializer


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
    datasets_name = serializers.SerializerMethodField()
    archive = AnnotationCampaignArchiveSerializer()
    usage = EnumField(enum=AnnotationCampaignUsage)

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
            "datasets_name",
            "created_at",
            "usage",
            "dataset_files_count",
        ]

    def get_datasets_name(self, campaign: AnnotationCampaign) -> list[str]:
        """Get datasets name"""
        return list(campaign.datasets.values_list("name", flat=True))

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
    spectro_configs = SpectrogramConfigurationSerializer(many=True)
    audio_metadata = serializers.SerializerMethodField()

    @extend_schema_field(AnnotationCampaignRetrieveAuxCampaignSerializer)
    def get_campaign(self, campaign: AnnotationCampaign):
        return AnnotationCampaignRetrieveAuxCampaignSerializer(campaign).data

    @extend_schema_field(AnnotationCampaignRetrieveAuxTaskSerializer(many=True))
    def get_tasks(self, campaign: AnnotationCampaign):
        return list(
            campaign.tasks.values("status", "annotator_id")
            .annotate(count=Count("status"))
            .order_by("status")  # will group by status
        )

    @extend_schema_field(AudioMetadatumSerializer(many=True))
    def get_audio_metadata(self, campaign: AnnotationCampaign):
        return AudioMetadatumSerializer(
            AudioMetadatum.objects.filter(dataset__in=campaign.datasets.all()),
            many=True,
        ).data

    def _is_campaign_owner(self, campaign: AnnotationCampaign):
        """Get information about current user ownership of this campaign"""
        return campaign.owner_id == self.context.get("user_id")
