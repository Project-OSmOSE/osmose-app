"""Annotation campaign list/retrieve serializer"""
from django.db.models import Count, Sum
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignUsage,
    AnnotationTask,
    SpectrogramConfiguration,
    Dataset,
    LabelSet,
    Label,
    ConfidenceIndicatorSet,
    ConfidenceIndicator,
)
from backend.aplose_auth.models import User
from backend.utils.serializers import EnumField


class AnnotationCampaignBasicSerializer(serializers.ModelSerializer):
    """Serializer for annotation file range"""

    files_count = serializers.SerializerMethodField(read_only=True)
    datasets = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Dataset.objects.all()
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
    label_set_labels = serializers.ListSerializer(
        write_only=True,
        required=False,
        child=serializers.CharField(),
    )
    confidence_indicator_set = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicatorSet.objects.all(),
        required=False,
    )
    confidence_set_indicators = serializers.ListSerializer(
        write_only=True,
        required=False,
        child=serializers.JSONField(),
    )
    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
    )
    spectro_configs = serializers.PrimaryKeyRelatedField(
        queryset=SpectrogramConfiguration.objects.all(),
        write_only=True,
        many=True,
    )

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

    def validate_check_usage(self, attrs: dict):
        """Validate attributes for a "check" usage creation"""
        if "label_set_labels" not in attrs or attrs["label_set_labels"] is None:
            raise serializers.ValidationError(
                {"label_set_labels": "This field is required."},
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
        self.validate_spectro_configs_in_datasets(attrs)
        if attrs["usage"] == AnnotationCampaignUsage.CREATE:
            self.validate_create_usage(attrs)
        if attrs["usage"] == AnnotationCampaignUsage.CHECK:
            self.validate_check_usage(attrs)
        return attrs

    def create_check_label_set(self, validated_data):
        """Check labels in label_set"""
        if "label_set_labels" not in validated_data:
            return
        if validated_data["label_set_labels"] is None:
            return
        label_set = LabelSet.objects.create(name=f"{validated_data['name']} label set")
        for label in validated_data["label_set_labels"]:
            obj, _ = Label.objects.get_or_create(name=label)
            label_set.labels.add(obj)
        validated_data["label_set"] = label_set
        del validated_data["label_set_labels"]

    def create_check_confidence_set(self, validated_data):
        """Check indicator in confidence set"""
        if "confidence_set_indicators" not in validated_data:
            return
        if validated_data["confidence_set_indicators"] is None:
            return
        confidence_set = ConfidenceIndicatorSet.objects.create(
            name=f"{validated_data['name']} confidence set"
        )
        for indicator in validated_data["confidence_set_indicators"]:
            ConfidenceIndicator.objects.create(
                **indicator, confidence_indicator_set=confidence_set
            )
        validated_data["confidence_indicator_set"] = confidence_set
        del validated_data["confidence_set_indicators"]

    def create(self, validated_data):
        if validated_data["usage"] == AnnotationCampaignUsage.CHECK:
            self.create_check_label_set(validated_data)
            self.create_check_confidence_set(validated_data)
        return super().create(validated_data)
