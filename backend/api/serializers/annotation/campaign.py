"""Annotation campaign list/retrieve serializer"""
from datetime import datetime

import pytz
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
    SpectrogramConfiguration,
    Dataset,
    LabelSet,
    AnnotationCampaignArchive,
    Label,
    ConfidenceIndicatorSet,
    AnnotationCampaignPhase,
    Phase,
)
from backend.aplose.models import User
from backend.aplose.serializers import UserSerializer
from backend.aplose.serializers.user import UserDisplayNameSerializer
from backend.utils.serializers import EnumField, SlugRelatedGetOrCreateField


class AnnotationCampaignArchiveSerializer(serializers.ModelSerializer):
    """Serializer for annotation campaign archive"""

    by_user = UserSerializer(read_only=True)

    class Meta:
        model = AnnotationCampaignArchive
        fields = "__all__"


class AnnotationCampaignPhaseSerializer(serializers.ModelSerializer):
    """Serializer for annotation campaign phase"""

    phase = EnumField(Phase)
    annotation_campaign = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationCampaign.objects.all()
    )

    created_by = UserDisplayNameSerializer(read_only=True)
    created_by_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=User.objects.all()
    )
    ended_by = UserDisplayNameSerializer(read_only=True)

    global_progress = serializers.IntegerField(read_only=True, default=0)
    global_total = serializers.IntegerField(read_only=True, default=0)
    user_progress = serializers.IntegerField(read_only=True, default=0)
    user_total = serializers.IntegerField(read_only=True, default=0)

    # has_annotations as a serializerMethod will give more requests but be quicker anyway:
    # on 22 items rendered:
    #  - SerializerMethodField: 47 queries | ~200ms
    #  - BooleanField on previous annotation: 7 queries | ~400ms
    has_annotations = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AnnotationCampaignPhase
        fields = "__all__"

    def get_has_annotations(self, phase: AnnotationCampaignPhase):
        """Return a boolean: if the phase has annotations or not"""
        if phase.phase == Phase.VERIFICATION:
            annotation_phase = phase.annotation_campaign.phases.filter(
                phase=Phase.ANNOTATION,
            )
            if annotation_phase.exists():
                return (
                    annotation_phase.first().results.exists() or phase.results.exists()
                )
        return phase.results.exists()

    def create(self, validated_data):
        creator = validated_data.pop("created_by_id")
        validated_data["created_by"] = creator
        return super().create(validated_data)


class AnnotationCampaignSerializer(serializers.ModelSerializer):
    """Serializer for annotation campaign"""

    files_count = serializers.IntegerField(read_only=True)
    datasets = serializers.SlugRelatedField(
        many=True, queryset=Dataset.objects.all(), slug_field="name"
    )
    label_set = serializers.PrimaryKeyRelatedField(read_only=True)
    labels_with_acoustic_features = SlugRelatedGetOrCreateField(
        slug_field="name",
        many=True,
        read_only=True,
    )
    confidence_indicator_set = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicatorSet.objects.all(), required=False, allow_null=True
    )
    owner = UserSerializer(read_only=True)
    spectro_configs = serializers.PrimaryKeyRelatedField(
        queryset=SpectrogramConfiguration.objects.all(), many=True, write_only=True
    )
    archive = AnnotationCampaignArchiveSerializer(read_only=True)
    allow_point_annotation = serializers.BooleanField(default=False)
    phases = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = AnnotationCampaign
        fields = "__all__"

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
        # if attrs["usage"] == AnnotationCampaignUsage.CREATE:
        #     self.validate_create_usage(attrs)
        # if attrs["usage"] == AnnotationCampaignUsage.CHECK:
        #     attrs["label_set"], _ = LabelSet.objects.get_or_create(
        #         name=f"{attrs['name']} label set"
        #     )
        # if "labels_with_acoustic_features" in attrs:
        #     label_set: LabelSet = attrs["label_set"]
        #     for label in attrs["labels_with_acoustic_features"]:
        #         if not label_set.labels.filter(name=label).exists():
        #             if attrs["usage"] == AnnotationCampaignUsage.CREATE:
        #                 message = (
        #                     "Label with acoustic features should belong to label set"
        #                 )
        #                 raise serializers.ValidationError(
        #                     {"labels_with_acoustic_features": message},
        #                 )
        #             if attrs["usage"] == AnnotationCampaignUsage.CHECK:
        #                 label_obj, _ = Label.objects.get_or_create(name=label)
        #                 label_set.labels.add(label_obj)
        return attrs

    # def create(self, validated_data):
    #     if validated_data["usage"] == AnnotationCampaignUsage.CHECK:
    #         validated_data["label_set"], _ = LabelSet.objects.get_or_create(
    #             name=f"{validated_data['name']} label set"
    #         )
    #     return super().create(validated_data)


class AnnotationCampaignPatchSerializer(serializers.Serializer):
    """Serializer for annotation campaign"""

    label_set = serializers.PrimaryKeyRelatedField(
        queryset=LabelSet.objects.all(),
        required=False,
    )
    labels_with_acoustic_features = serializers.SlugRelatedField(
        queryset=Label.objects.all(),
        slug_field="name",
        required=False,
        many=True,
    )
    confidence_indicator_set = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicatorSet.objects.all(),
        required=False,
        allow_null=True,
    )
    allow_point_annotation = serializers.BooleanField(
        required=False,
    )

    class Meta:
        fields = "__all__"

    def create(self, validated_data):
        pass

    def update(self, instance: AnnotationCampaign, validated_data):
        if "label_set" in validated_data:
            instance.label_set = validated_data.get("label_set")
        if "labels_with_acoustic_features" in validated_data:
            label_set: LabelSet = instance.label_set or validated_data.get("label_set")
            for label in validated_data["labels_with_acoustic_features"]:
                if not label_set.labels.filter(name=label).exists():
                    message = "Label with acoustic features should belong to label set"
                    raise serializers.ValidationError(
                        {"labels_with_acoustic_features": message},
                    )
            instance.labels_with_acoustic_features.set(
                validated_data["labels_with_acoustic_features"]
            )
        if "confidence_indicator_set" in validated_data:
            instance.confidence_indicator_set = validated_data.get(
                "confidence_indicator_set"
            )
        if "allow_point_annotation" in validated_data:
            instance.allow_point_annotation = validated_data.get(
                "allow_point_annotation"
            )

        instance.save()
        return instance
