"""Annotation campaign create DRF serializers file"""

from datetime import timedelta, datetime

from dateutil import parser
from rest_framework import serializers

from backend.api.models import (
    User,
    AnnotationCampaign,
    Dataset,
    AnnotationSet,
    SpectroConfig,
    ConfidenceIndicatorSet,
    AnnotationCampaignUsage,
    AnnotationTag,
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
            "annotation_set",
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
        annotation_set = validated_data["annotation_set"]  # type: AnnotationSet
        confidence_indicator_set = validated_data[
            "confidence_indicator_set"
        ]  # type: ConfidenceIndicatorSet | None

        campaign = AnnotationCampaign(
            name=validated_data["name"],
            desc=validated_data.get("desc"),
            start=validated_data.get("start"),
            end=validated_data.get("end"),
            annotation_set=annotation_set,
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


class AnnotationCampaignCreateCheckAnnotationsSerializer(serializers.ModelSerializer):
    """Serializer meant for AnnotationCampaign creation with corresponding tasks"""

    annotation_goal = serializers.IntegerField(min_value=1)
    annotation_set_labels = serializers.ListField(child=serializers.CharField())
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
            "annotation_set_labels",
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

    def get_annotation_set_name(self, target_name: str) -> str:
        """Create automatically new annotation set name"""
        if AnnotationSet.objects.filter(name=target_name):
            return self.get_annotation_set_name(target_name + "_1")
        return target_name

    def get_confidence_set_name(self, target_name: str) -> str:
        """Create automatically new confidence set name"""
        if ConfidenceIndicatorSet.objects.filter(name=target_name):
            return self.get_confidence_set_name(target_name + "_1")
        return target_name

    def get_annotation_set(self, campaign_name: str, labels: [str]) -> AnnotationSet:
        """Get annotation set for creating annotation campaign"""
        annotation_set = AnnotationSet.objects.create(
            name=self.get_annotation_set_name(f"{campaign_name}_set"),
            desc=f"Annotation set for {campaign_name} campaign",
        )
        for label in labels:
            tag = AnnotationTag.objects.get_or_create(name=label)
            annotation_set.tags.add(tag[0])
        annotation_set.save()
        return annotation_set

    def get_confidence_set(
        self, campaign_name: str, indicators: list
    ) -> ConfidenceIndicatorSet | None:
        """Get confidence set for creating annotation campaign"""
        confidence_set = None
        for data in indicators:
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

    def get_result_start(self, is_box: bool, result: any) -> datetime:
        """Get result absolute start"""
        start_delta = 0
        if is_box and "min_time" in result:
            start_delta = result["min_time"]
        return parser.parse(result["start_datetime"]) + timedelta(seconds=start_delta)

    def get_result_end(self, is_box: bool, result: any) -> datetime:
        """Get result absolute end"""
        if is_box and "max_time" in result:
            return parser.parse(result["start_datetime"]) + timedelta(
                seconds=result["max_time"]
            )
        return parser.parse(result["end_datetime"])

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
        confidence_set: ConfidenceIndicatorSet | None,
        results: list,
        force: bool,
    ):
        """Create results objects"""
        missing_matches = 0
        for result in results:
            dataset = Dataset.objects.get(name=result["dataset"])
            is_box = bool(result["is_box"])
            start = self.get_result_start(is_box, result)
            end = self.get_result_end(is_box, result)
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
                    annotation_tag=AnnotationTag.objects.get(name=result["tag"]),
                    confidence_indicator=confidence_indicator,
                    dataset_file=dataset_files.first(),
                )
                continue

            for dataset_file in dataset_files:
                if start < dataset_file.audio_metadatum.start:
                    start_time = 0
                else:
                    start_time = (start - dataset_file.audio_metadatum.start).seconds
                if end > dataset_file.audio_metadatum.end:
                    end_time = (
                        dataset_file.audio_metadatum.end
                        - dataset_file.audio_metadatum.start
                    ).seconds
                else:
                    end_time = (end - dataset_file.audio_metadatum.start).seconds
                AnnotationResult.objects.create(
                    annotation_campaign=campaign,
                    detector_configuration=detector_config,
                    annotation_tag=AnnotationTag.objects.get(name=result["tag"]),
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

        annotation_set = self.get_annotation_set(
            validated_data["name"], validated_data["annotation_set_labels"]
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
            annotation_set_id=annotation_set.id,
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
            force=validated_data["force"],
        )

        return create_campaign_with_annotators(
            campaign=campaign,
            goal=int(validated_data["annotation_goal"]),
            annotators=validated_data["annotators"],
        )
