"""Annotation result serializer"""
from datetime import datetime, timedelta
from typing import Optional

from django.db.models import QuerySet
from rest_framework import serializers
from rest_framework.fields import empty

from backend.api.models import (
    AnnotationResult,
    Label,
    AnnotationCampaign,
    ConfidenceIndicator,
    DatasetFile,
    AnnotationComment,
    AnnotationResultValidation,
    Dataset,
    Detector,
    DetectorConfiguration,
    ConfidenceIndicatorSet,
    AnnotationCampaignUsage,
    ConfidenceIndicatorSetIndicator,
)
from backend.aplose.models import User
from backend.utils.serializers import ListSerializer, SlugRelatedGetOrCreateField
from .comment import AnnotationCommentSerializer
from .confidence_indicator_set import (
    ConfidenceIndicatorSerializer,
)


def to_seconds(delta: timedelta) -> float:
    """Format seconds timedelta as float"""
    return delta.seconds + delta.microseconds / 1000000


class AnnotationResultImportSerializer(serializers.Serializer):
    """Annotation result serializer for detection importation"""

    is_box = serializers.BooleanField()
    dataset = serializers.SlugRelatedField(
        queryset=Dataset.objects.all(),
        slug_field="name",
    )
    detector = serializers.CharField()
    detector_config = serializers.CharField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    min_frequency = serializers.FloatField(min_value=0)
    max_frequency = serializers.FloatField(min_value=0)
    label = SlugRelatedGetOrCreateField(
        queryset=Label.objects,
        slug_field="name",
    )
    confidence_indicator = serializers.DictField(allow_null=True)

    class Meta:
        list_serializer_class = ListSerializer

    def get_fields(self):
        fields = super().get_fields()
        campaign: Optional[AnnotationCampaign] = (
            self.context["campaign"] if "campaign" in self.context else None
        )

        if campaign is not None:
            fields["dataset"].queryset = campaign.datasets
            if campaign.usage is AnnotationCampaignUsage.CREATE:
                fields["label"].queryset = campaign.label_set.labels
                if campaign.confidence_indicator_set is not None:
                    fields["confidence_indicator"] = ConfidenceIndicatorSerializer(
                        required=True,
                    )
            max_frequency = (
                max(d.audio_metadatum.dataset_sr for d in campaign.datasets.all()) / 2
            )
            fields["min_frequency"] = serializers.FloatField(
                required=False, min_value=0.0, max_value=max_frequency
            )
            fields["max_frequency"] = serializers.FloatField(
                required=False, min_value=0.0, max_value=max_frequency
            )

        return fields

    def run_validation(self, data=empty):
        try:
            data = super().run_validation(data)
        except AssertionError as error:
            if ".validate() should return the validated data" in str(error):
                return None
            raise error
        except Exception as error:
            raise error

        return data

    def validate(self, attrs):
        attrs = super().validate(attrs)
        dataset = attrs["dataset"]
        start = attrs["start_datetime"]
        end = attrs["end_datetime"]
        dataset_files = dataset.get_files(start, end)
        if not dataset_files:
            if self.context["force"]:
                return None
            raise serializers.ValidationError(
                "This start and end datetime does not belong to any file of the dataset",
                code="invalid",
            )
        max_freq = dataset.audio_metadatum.dataset_sr / 2
        if attrs["min_frequency"] > max_freq:
            raise serializers.ValidationError(
                {
                    "min_frequency": f"Ensure this value is less than or equal to {max_freq}."
                },
                code="max_value",
            )
        if attrs["max_frequency"] > max_freq:
            raise serializers.ValidationError(
                {
                    "max_frequency": f"Ensure this value is less than or equal to {max_freq}."
                },
                code="max_value",
            )
        attrs["files"] = dataset_files
        return attrs

    def get_confidence_set(self, name, index=0):
        """Recover appropriate confidence set based on the campaign name"""
        real_name = name if index == 0 else f"{name} ({index})"
        if ConfidenceIndicatorSet.objects.filter(name=real_name).exists():
            return self.get_confidence_set(name, index + 1)
        return ConfidenceIndicatorSet.objects.create(name=real_name)

    def create(self, validated_data):
        is_box: bool = validated_data["is_box"]

        files: QuerySet[DatasetFile] = validated_data["files"]
        campaign: AnnotationCampaign = self.context["campaign"]
        detector, _ = Detector.objects.get_or_create(name=validated_data["detector"])
        detector_config, _ = DetectorConfiguration.objects.get_or_create(
            detector=detector,
            configuration=validated_data["detector_config"],
        )
        label, _ = Label.objects.get_or_create(name=validated_data["label"])
        if not campaign.label_set.labels.filter(id=label.id).exists():
            campaign.label_set.labels.add(label)
        confidence_indicator = None
        if (
            "confidence_indicator" in validated_data
            and validated_data["confidence_indicator"] is not None
        ):
            if campaign.confidence_indicator_set is None:
                campaign.confidence_indicator_set = self.get_confidence_set(
                    name=f"{campaign.name} confidence set"
                )
            confidence_indicator, _ = ConfidenceIndicator.objects.get_or_create(
                label=validated_data["confidence_indicator"].get("label"),
                level=validated_data["confidence_indicator"].get("level"),
            )
            is_default = validated_data["confidence_indicator"].pop("is_default", None)
            ConfidenceIndicatorSetIndicator.objects.get_or_create(
                confidence_indicator=confidence_indicator,
                confidence_indicator_set=campaign.confidence_indicator_set,
                is_default=is_default or False,
            )
        if not is_box and files.count() == 1:
            return AnnotationResult.objects.create(
                annotation_campaign=campaign,
                detector_configuration=detector_config,
                label=label,
                confidence_indicator=confidence_indicator,
                dataset_file=files.first(),
            )

        instances = []
        start: datetime = validated_data["start_datetime"]
        end: datetime = validated_data["end_datetime"]
        dataset: Dataset = validated_data["dataset"]
        for file in files:
            if start < file.start:
                start_time = 0
            else:
                start_time = to_seconds(start - file.start)
            if end > file.end:
                end_time = to_seconds(file.end - file.start)
            else:
                end_time = to_seconds(end - file.start)

            instances.append(
                AnnotationResult(
                    annotation_campaign=campaign,
                    detector_configuration=detector_config,
                    label=label,
                    confidence_indicator=confidence_indicator,
                    dataset_file=file,
                    start_frequency=validated_data["min_frequency"]
                    if "min_frequency" in validated_data and is_box
                    else 0,
                    end_frequency=validated_data["max_frequency"]
                    if "max_frequency" in validated_data and is_box
                    else dataset.audio_metadatum.dataset_sr / 2,
                    start_time=start_time,
                    end_time=end_time,
                )
            )

        return AnnotationResult.objects.bulk_create(instances)

    def update(self, instance, validated_data):
        raise NotImplementedError("`update()` must be implemented.")


class AnnotationResultImportListSerializer(ListSerializer):
    """Annotation result list serializer for detection importation"""

    child = AnnotationResultImportSerializer()

    def is_valid(self, *, raise_exception=False):
        data = super().is_valid(raise_exception=raise_exception)
        # pylint: disable=attribute-defined-outside-init
        self._validated_data = [
            data for data in self._validated_data if data is not None
        ]
        return data

    def create(self, validated_data: list[dict]):
        result = super().create(validated_data)
        ids = []
        for new_result in result:
            try:
                ids.append(new_result.id)
            except AttributeError:
                ids += [r.id for r in new_result]
        return AnnotationResult.objects.filter(id__in=ids)


class AnnotationResultValidationSerializer(serializers.ModelSerializer):
    """Annotation result validation serializer for annotator"""

    id = serializers.IntegerField(required=False)
    annotator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    result = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationResult.objects.all(), required=False
    )

    class Meta:
        model = AnnotationResultValidation
        fields = "__all__"
        list_serializer_class = ListSerializer


class DetectorConfigurationSerializer(serializers.ModelSerializer):
    """Annotation result detector serializer for annotator"""

    detector = serializers.SlugRelatedField(
        queryset=Detector.objects.all(),
        slug_field="name",
    )

    class Meta:
        model = DetectorConfiguration
        fields = "__all__"


class AnnotationResultSerializer(serializers.ModelSerializer):
    """Annotation result serializer for annotator"""

    id = serializers.IntegerField(required=False, allow_null=True)
    annotation_campaign = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationCampaign.objects.all()
    )
    label = serializers.SlugRelatedField(
        queryset=Label.objects.all(),
        slug_field="name",
    )
    confidence_indicator = serializers.SlugRelatedField(
        queryset=ConfidenceIndicator.objects.all(),
        slug_field="label",
        required=False,
        allow_null=True,
    )
    annotator = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )
    dataset_file = serializers.PrimaryKeyRelatedField(
        queryset=DatasetFile.objects.all(),
    )
    detector_configuration = DetectorConfigurationSerializer(
        required=False, allow_null=True
    )
    start_time = serializers.FloatField(
        required=False,
        allow_null=True,
        min_value=0.0,
    )
    end_time = serializers.FloatField(
        required=False,
        allow_null=True,
        min_value=0.0,
    )
    start_frequency = serializers.FloatField(
        required=False,
        allow_null=True,
        min_value=0.0,
    )
    end_frequency = serializers.FloatField(
        required=False,
        allow_null=True,
        min_value=0.0,
    )
    comments = AnnotationCommentSerializer(many=True, required=False)
    validations = AnnotationResultValidationSerializer(many=True, required=False)

    class Meta:
        model = AnnotationResult
        fields = "__all__"
        list_serializer_class = ListSerializer

    def get_fields(self):
        fields = super().get_fields()
        campaign: Optional[AnnotationCampaign] = (
            self.context["campaign"] if "campaign" in self.context else None
        )
        file: Optional[DatasetFile] = (
            self.context["file"] if "file" in self.context else None
        )

        if campaign is not None:
            fields["label"].queryset = campaign.label_set.labels
            fields["dataset_file"].queryset = DatasetFile.objects.filter(
                dataset__annotation_campaigns__id=campaign.id
            )
            if campaign.confidence_indicator_set is not None:
                fields["confidence_indicator"] = serializers.SlugRelatedField(
                    queryset=campaign.confidence_indicator_set.confidence_indicators,
                    slug_field="label",
                    required=True,
                    allow_null=False,
                )

        if file is not None:
            fields["start_time"] = serializers.FloatField(
                required=False,
                allow_null=True,
                min_value=0.0,
                max_value=(file.end - file.start).seconds,
            )
            fields["end_time"] = serializers.FloatField(
                required=False,
                allow_null=True,
                min_value=0.0,
                max_value=(file.end - file.start).seconds,
            )
            fields["start_frequency"] = serializers.FloatField(
                required=False,
                allow_null=True,
                min_value=0.0,
                max_value=file.dataset.audio_metadatum.dataset_sr / 2,
            )
            fields["end_frequency"] = serializers.FloatField(
                required=False,
                allow_null=True,
                min_value=0.0,
                max_value=file.dataset.audio_metadatum.dataset_sr / 2,
            )

        return fields

    def validate(self, attrs):
        # Reorder start/end
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")
        if end_time is not None and (start_time is None or start_time > end_time):
            attrs["start_time"] = end_time
            attrs["end_time"] = start_time
        start_frequency = attrs.get("start_frequency")
        end_frequency = attrs.get("end_frequency")
        if end_frequency is not None and (
            start_frequency is None or start_frequency > end_frequency
        ):
            attrs["start_frequency"] = end_frequency
            attrs["end_frequency"] = start_frequency
        return super().validate(attrs)

    def create(self, validated_data):
        comments = AnnotationCommentSerializer(
            validated_data.pop("comments", []), many=True
        ).data
        validations = AnnotationResultValidationSerializer(
            validated_data.pop("validations", []), many=True
        ).data
        instance = super().create(validated_data)

        # Comments
        comments_serializer = AnnotationCommentSerializer(
            data=[{**c, "annotation_result": instance.id} for c in comments], many=True
        )
        comments_serializer.is_valid(raise_exception=True)
        comments_serializer.save()

        # Validations
        validations_serializer = AnnotationResultValidationSerializer(
            data=[{**v, "result": instance.id} for v in validations],
            many=True,
        )
        validations_serializer.is_valid(raise_exception=True)
        validations_serializer.save()

        return instance

    def update(self, instance, validated_data):
        comments = AnnotationCommentSerializer(
            validated_data.pop("comments", []), many=True
        ).data
        validations = AnnotationResultValidationSerializer(
            validated_data.pop("validations", []), many=True
        ).data

        initial_detector_config = validated_data.get("detector_configuration", None)
        if initial_detector_config is not None:
            validated_data[
                "detector_configuration"
            ] = DetectorConfiguration.objects.filter(**initial_detector_config).first()

        if hasattr(instance, "first") and callable(getattr(instance, "first")):
            instance = instance.first()

        instance = super().update(instance, validated_data)

        # Comments
        instance_comments = AnnotationComment.objects.filter(
            annotation_result__id=instance.id
        )
        comments_serializer = AnnotationCommentSerializer(
            instance_comments,
            data=[
                {
                    **c,
                    "annotation_result": instance.id,
                }
                for c in comments
            ],
            many=True,
        )
        comments_serializer.is_valid(raise_exception=True)
        comments_serializer.save()

        # Validations
        instance_validations = AnnotationResultValidation.objects.filter(
            result__id=instance.id
        )
        validations_serializer = AnnotationResultValidationSerializer(
            instance_validations,
            data=[{**v, "result": instance.id} for v in validations],
            many=True,
        )
        validations_serializer.is_valid(raise_exception=True)
        validations_serializer.save()

        return self.Meta.model.objects.get(pk=instance.id)
