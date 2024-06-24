"""Annotation campaign create DRF serializers file"""

from datetime import datetime, timedelta
from typing import Optional

from dateutil import parser
from rest_framework import serializers

from backend.api.models import (
    User,
    AnnotationCampaign,
    Dataset,
    LabelSet,
    SpectroConfig,
    ConfidenceIndicatorSet,
    AnnotationCampaignUsage,
    Label,
    ConfidenceIndicator,
    Detector,
    DetectorConfiguration,
    AnnotationResult,
)
from backend.api.serializers.utils import EnumField
from backend.utils.validators import valid_model_ids
from ._utils_ import (
    create_campaign_with_annotators,
    check_annotation_goal,
    check_spectro_configs_in_datasets,
)


class AnnotationCampaignCreateCreateAnnotationsSerializer(serializers.ModelSerializer):
    """Serializer meant for AnnotationCampaign creation with corresponding tasks"""

    annotators = serializers.ListField(
        child=serializers.IntegerField(), validators=[valid_model_ids(User)]
    )
    annotation_goal = serializers.IntegerField(min_value=1)
    usage = EnumField(enum=AnnotationCampaignUsage)

    class Meta:
        model = AnnotationCampaign
        # pylint:disable=duplicate-code
        fields = [
            "name",
            "desc",
            "instructions_url",
            "start",
            "end",
            "datasets",
            "spectro_configs",
            "label_set",
            "confidence_indicator_set",
            "annotators",
            "annotation_goal",
            "annotation_scope",
            "usage",
        ]

    def validate(self, attrs):
        """Validates given data"""

        check_annotation_goal(attrs)
        check_spectro_configs_in_datasets(attrs)

        # Handle non-present confidence set
        if "confidence_indicator_set" not in attrs:
            attrs["confidence_indicator_set"] = None
        return attrs

    def create(self, validated_data):
        label_set: LabelSet = validated_data["label_set"]
        confidence_indicator_set: Optional[ConfidenceIndicatorSet] = validated_data[
            "confidence_indicator_set"
        ]

        campaign = AnnotationCampaign(
            name=validated_data["name"],
            desc=validated_data.get("desc"),
            start=validated_data.get("start"),
            end=validated_data.get("end"),
            label_set=label_set,
            confidence_indicator_set=confidence_indicator_set,
            annotation_scope=validated_data["annotation_scope"],
            usage=validated_data["usage"],
            owner_id=validated_data["owner_id"],
            instructions_url=validated_data.get("instructions_url"),
        )

        spectro_configs = validated_data["spectro_configs"]  # type: list[SpectroConfig]
        datasets = validated_data["datasets"]  # type: list[Dataset]

        campaign.save()
        campaign.datasets.set(datasets)
        campaign.spectro_configs.set(spectro_configs)

        return create_campaign_with_annotators(
            campaign=campaign,
            goal=int(validated_data["annotation_goal"]),
            annotators=validated_data["annotators"],
        )


def to_seconds(delta: timedelta) -> float:
    """Format seconds timedelta as float"""
    return delta.seconds + delta.microseconds / 1000000


class AnnotationCampaignCreateCheckAnnotationsSerializer(serializers.ModelSerializer):
    """Serializer meant for AnnotationCampaign creation with corresponding tasks"""

    annotation_goal = serializers.IntegerField(min_value=1)
    label_set_labels = serializers.ListField(child=serializers.CharField())
    confidence_set_indicators = serializers.ListField(
        allow_empty=True,
        required=False,
    )
    detectors = serializers.ListField()
    usage = EnumField(enum=AnnotationCampaignUsage)
    results = serializers.ListField()
    annotators = serializers.ListField(
        child=serializers.IntegerField(),
        validators=[valid_model_ids(User)],
    )
    force = serializers.BooleanField(required=False, allow_null=True)

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
            "datasets",
            "spectro_configs",
            "spectro_configs",
            "annotators",
            "annotation_goal",
            "annotation_scope",
            "usage",
            "label_set_labels",
            "confidence_set_indicators",
            "detectors",
            "results",
            "force",
        ]

    def validate(self, attrs):
        """Validates given data"""

        check_annotation_goal(attrs)
        check_spectro_configs_in_datasets(attrs)

        # Handle non-present confidence set
        if "confidence_set_indicators" not in attrs:
            attrs["confidence_set_indicators"] = None
        return attrs

    def get_label_set_name(self, target_name):
        """Create automatically new label set name"""
        if LabelSet.objects.filter(name=target_name):
            return self.get_label_set_name(target_name + "_1")
        return target_name

    def get_confidence_set_name(self, target_name: str) -> str:
        """Create automatically new confidence set name"""
        if ConfidenceIndicatorSet.objects.filter(name=target_name):
            return self.get_confidence_set_name(target_name + "_1")
        return target_name

    def get_label_set(self, campaign_name: str, labels: [str]) -> LabelSet:
        """Get label set for creating annotation campaign"""
        label_set = LabelSet.objects.create(
            name=self.get_label_set_name(f"{campaign_name}_set"),
            desc=f"Label set for {campaign_name} campaign",
        )
        for label_name in labels:
            label = Label.objects.get_or_create(name=label_name)
            label_set.labels.add(label[0])
        label_set.save()
        return label_set

    def get_confidence_set(
        self, campaign_name: str, indicators: list
    ) -> Optional[ConfidenceIndicatorSet]:
        """Get confidence set for creating annotation campaign"""
        confidence_set = None
        for data in indicators or []:
            if data[0] is None or data[1] is None:
                continue
            if confidence_set is None:
                confidence_set = ConfidenceIndicatorSet.objects.create(
                    name=self.get_confidence_set_name(f"{campaign_name}_set"),
                    desc=f"Confidence set for {campaign_name} campaign",
                )
            confidence_set.confidence_indicators.get_or_create(
                label=data[0],
                level=data[1],
            )
        if confidence_set is not None:
            confidence_set.save()
        return confidence_set

    def manage_detectors(self, detectors_data: list):
        """Manage detectors for creating annotation campaign"""
        for detector in detectors_data:
            detector_name = detector.pop("detectorName")
            detector_id = None
            detector_config_id = None
            try:
                detector_id = detector.pop("detectorId")
                detector_config_id = detector.pop("configurationId")
            except KeyError as key:
                print(f"No {key} provided for detector")
            detector_config = detector.pop("configuration")
            detector_obj = None
            if detector_id is not None:
                detector_obj = Detector.objects.get(pk=detector_id)
            if detector_obj is None:
                detector_obj = Detector.objects.get_or_create(name=detector_name)[0]
            if detector_config_id is None:
                detector_obj.configurations.get_or_create(configuration=detector_config)
            detector_obj.save()

    def get_dataset_files(self, dataset: Dataset, start: datetime, end: datetime):
        """Get dataset files from absolute start and ends"""
        dataset_files_start = dataset.files.filter(
            audio_metadatum__start__lte=start,
            audio_metadatum__end__gte=start,
        )
        dataset_files_while = dataset.files.filter(
            audio_metadatum__start__gt=start,
            audio_metadatum__end__lt=end,
        )
        dataset_files_end = dataset.files.filter(
            audio_metadatum__start__lte=end,
            audio_metadatum__end__gte=end,
        )
        return dataset_files_start | dataset_files_while | dataset_files_end

    def create_results(
        self,
        campaign: AnnotationCampaign,
        confidence_set: Optional[ConfidenceIndicatorSet],
        results: list,
        force: bool,
    ):
        """Create results objects"""
        missing_matches = 0
        for result in results:
            dataset = Dataset.objects.get(name=result["dataset"])
            is_box = bool(result["is_box"])
            start = parser.parse(result["start_datetime"])
            end = parser.parse(result["end_datetime"])
            dataset_files = self.get_dataset_files(dataset, start, end)
            if not dataset_files:
                missing_matches = missing_matches + 1
            detector = Detector.objects.filter(name=result["detector"]).first()
            detector_config = DetectorConfiguration.objects.filter(
                detector=detector, configuration=result["detector_config"]
            ).first()
            confidence_indicator = None
            if "confidence" in result:
                confidence_indicator = ConfidenceIndicator.objects.get(
                    label=result["confidence"],
                    confidence_indicator_set=confidence_set,
                )

            if not is_box and dataset_files.count() == 1:
                AnnotationResult.objects.create(
                    annotation_campaign=campaign,
                    detector_configuration=detector_config,
                    label=Label.objects.get(name=result["label"]),
                    confidence_indicator=confidence_indicator,
                    dataset_file=dataset_files.first(),
                )
                continue

            for dataset_file in dataset_files:
                if start < dataset_file.audio_metadatum.start:
                    start_time = 0
                else:
                    start_time = to_seconds(start - dataset_file.audio_metadatum.start)
                if end > dataset_file.audio_metadatum.end:
                    end_time = to_seconds(
                        dataset_file.audio_metadatum.end
                        - dataset_file.audio_metadatum.start
                    )
                else:
                    end_time = to_seconds(end - dataset_file.audio_metadatum.start)

                AnnotationResult.objects.create(
                    annotation_campaign=campaign,
                    detector_configuration=detector_config,
                    label=Label.objects.get(name=result["label"]),
                    confidence_indicator=confidence_indicator,
                    dataset_file=dataset_file,
                    start_frequency=result["min_frequency"]
                    if "min_frequency" in result and is_box
                    else 0,
                    end_frequency=result["max_frequency"]
                    if "max_frequency" in result and is_box
                    else dataset.audio_metadatum.dataset_sr / 2,
                    start_time=start_time,
                    end_time=end_time,
                )

        if missing_matches and not force:
            raise serializers.ValidationError(
                {
                    "dataset_file_not_found": f"Didn't find any corresponding file for {missing_matches} "
                    f"result{'s' if missing_matches > 0 else ''}"
                }
            )

    def create(self, validated_data):
        """Create annotation campaign"""

        label_set = self.get_label_set(
            validated_data["name"], validated_data["label_set_labels"]
        )
        confidence_set = self.get_confidence_set(
            validated_data["name"], validated_data["confidence_set_indicators"]
        )
        self.manage_detectors(validated_data["detectors"])

        campaign = AnnotationCampaign(
            name=validated_data["name"],
            desc=validated_data.get("desc"),
            start=validated_data.get("start"),
            end=validated_data.get("end"),
            label_set_id=label_set.id,
            confidence_indicator_set_id=confidence_set.id
            if confidence_set is not None
            else None,
            annotation_scope=validated_data["annotation_scope"],
            usage=validated_data["usage"],
            owner_id=validated_data["owner_id"],
            instructions_url=validated_data.get("instructions_url"),
        )
        campaign.save()
        campaign.datasets.set(validated_data["datasets"])
        campaign.spectro_configs.set(validated_data["spectro_configs"])

        # Create results
        self.create_results(
            campaign,
            confidence_set,
            results=validated_data["results"],
            force=validated_data["force"] if "force" in validated_data else False,
        )

        return create_campaign_with_annotators(
            campaign=campaign,
            goal=int(validated_data["annotation_goal"]),
            annotators=validated_data["annotators"],
        )
