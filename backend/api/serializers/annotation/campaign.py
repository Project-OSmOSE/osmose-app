"""Annotation campaign list/retrieve serializer"""
from datetime import datetime

import pytz
from django.db.models import Count, Sum
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignUsage,
    AnnotationTask,
    SpectrogramConfiguration,
    Dataset,
    LabelSet,
    ConfidenceIndicatorSet,
    AnnotationCampaignArchive,
)
from backend.aplose.models import User
from backend.aplose.serializers import UserSerializer
from backend.utils.serializers import EnumField


class AnnotationCampaignArchiveSerializer(serializers.ModelSerializer):
    """Serializer for annotation campaign archive"""

    by_user = UserSerializer(read_only=True)

    class Meta:
        model = AnnotationCampaignArchive
        fields = "__all__"


class AnnotationCampaignBasicSerializer(serializers.ModelSerializer):
    """Serializer for annotation campaign"""

    files_count = serializers.SerializerMethodField(read_only=True)
    datasets = serializers.SlugRelatedField(
        many=True, queryset=Dataset.objects.all(), slug_field="name"
    )
    my_progress = serializers.SerializerMethodField(read_only=True)
    my_total = serializers.IntegerField(read_only=True)
    progress = serializers.SerializerMethodField(read_only=True)
    total = serializers.IntegerField(read_only=True)
    usage = EnumField(enum=AnnotationCampaignUsage)

    label_set = serializers.PrimaryKeyRelatedField(
        queryset=LabelSet.objects.all(),
        required=False,
    )
    confidence_indicator_set = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicatorSet.objects.all(), required=False, allow_null=True
    )
    owner = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field="username",
        required=False,
    )
    spectro_configs = serializers.PrimaryKeyRelatedField(
        queryset=SpectrogramConfiguration.objects.all(),
        many=True,
    )
    archive = AnnotationCampaignArchiveSerializer(read_only=True)

    class Meta:
        model = AnnotationCampaign
        fields = "__all__"

    def get_files_count(self, campaign: AnnotationCampaign) -> int:
        """Get dataset files cont"""
        return campaign.datasets.annotate(count=Count("files")).aggregate(
            total=Sum("count")
        )["total"]

    def get_progress(self, campaign: AnnotationCampaign) -> int:
        """Get progress"""
        return campaign.tasks.filter(status=AnnotationTask.Status.FINISHED).count()

    def get_my_progress(self, campaign: AnnotationCampaign) -> int:
        """Get current user progress"""
        return campaign.tasks.filter(
            annotator_id=self.context["request"].user.id,
            status=AnnotationTask.Status.FINISHED,
        ).count()

    def validate_create_usage(self, attrs: dict):
        """Validate attributes for a "create" usage creation"""
        if "label_set" not in attrs or attrs["label_set"] is None:
            raise serializers.ValidationError(
                {"label_set": "This field is required."},
                code="required",
            )

    def validate_spectro_configs_in_datasets(self, attrs: dict) -> None:
        """Validates that chosen spectros correspond to chosen datasets"""
        spectro_configs: list[SpectrogramConfiguration] = attrs["spectro_configs"]
        datasets: list[Dataset] = attrs["datasets"]
        bad_vals = []
        for spectro in spectro_configs:
            if spectro.dataset not in datasets:
                bad_vals.append(str(spectro))
        if bad_vals:
            error = f"{bad_vals} not valid ids for spectro configs of given datasets ({[str(d) for d in datasets]})"
            raise serializers.ValidationError({"spectro_configs": error})

    def validate(self, attrs):
        attrs = super().validate(attrs)
        attrs["owner"] = self.context["request"].user
        if (
            "deadline" in attrs
            and attrs["deadline"] is not None
            and attrs["deadline"] < datetime.now(tz=pytz.UTC).date()
        ):
            raise serializers.ValidationError(
                {"deadline": "Deadline date should be in the future."},
                code="min_value",
            )
        self.validate_spectro_configs_in_datasets(attrs)
        if attrs["usage"] == AnnotationCampaignUsage.CREATE:
            self.validate_create_usage(attrs)
        return attrs

    def create(self, validated_data):
        if validated_data["usage"] == AnnotationCampaignUsage.CHECK:
            validated_data["label_set"], _ = LabelSet.objects.get_or_create(
                name=f"{validated_data['name']} label set"
            )
        return super().create(validated_data)
