"""Annotation campaign DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method
from django.db.models import Count

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field
from django.shortcuts import get_object_or_404

from backend.utils.validators import valid_model_ids
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
    DatasetFile,
    Detector,
    DetectorConfiguration,
    AnnotationResult,
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


def add_annotators(campaign, goal, annotators):
    # type: (AnnotationCampaign, int, list) -> AnnotationCampaign
    file_count = sum(
        campaign.datasets.annotate(Count("files")).values_list(
            "files__count", flat=True
        )
    )
    total_goal = file_count * goal
    annotator_goal, remainder = divmod(total_goal, len(annotators))
    for annotator in User.objects.filter(id__in=annotators):
        files_target = annotator_goal
        if remainder > 0:
            files_target += 1
            remainder -= 1
        campaign.add_annotator(annotator, files_target)
    return campaign


class AnnotationCampaignCreateSerializer(serializers.ModelSerializer):
    """Serializer meant for AnnotationCampaign creation with corresponding tasks"""

    desc = serializers.CharField(required=False)
    instructions_url = serializers.CharField(required=False)
    start = serializers.DateTimeField(required=False)
    end = serializers.DateTimeField(required=False)
    annotation_set_id = serializers.IntegerField(
        validators=[valid_model_ids(AnnotationSet)], required=False
    )
    confidence_indicator_set_id = serializers.IntegerField(
        validators=[valid_model_ids(ConfidenceIndicatorSet)],
        required=False,
    )
    datasets = serializers.ListField(
        child=serializers.IntegerField(),
        validators=[valid_model_ids(Dataset)],
        allow_empty=False,
    )
    annotation_set_labels = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
    confidence_set_indicators = serializers.ListField(
        allow_empty=True,
    )
    detectors = serializers.ListField(
        allow_empty=True,
    )
    results = serializers.ListField(
        allow_empty=True,
    )
    spectro_configs = serializers.ListField(
        child=serializers.IntegerField(),
        validators=[valid_model_ids(SpectroConfig)],
        allow_empty=False,
    )
    annotators = serializers.ListField(
        child=serializers.IntegerField(), validators=[valid_model_ids(User)]
    )
    annotation_method = serializers.IntegerField(
        min_value=0, max_value=1, required=False
    )
    annotation_goal = serializers.IntegerField(min_value=1)
    usage = EnumField(enum=AnnotationCampaignUsage)

    class Meta:
        model = AnnotationCampaign
        fields = [
            "id",
            "name",
            "desc",
            "instructions_url",
            "start",
            "end",
            "annotation_set_id",
            "confidence_indicator_set_id",
            "spectro_configs",
            "datasets",
            "annotators",
            "annotation_method",
            "annotation_goal",
            "annotation_scope",
            "usage",
            "annotation_set_labels",
            "confidence_set_indicators",
            "detectors",
            "results",
        ]

    def validate(self, attrs):
        """Validates that chosen spectros correspond to chosen datasets"""
        db_spectros = Dataset.objects.filter(id__in=attrs["datasets"]).values_list(
            "spectro_configs", flat=True
        )
        bad_vals = set(attrs["spectro_configs"]) - set(db_spectros)
        if bad_vals:
            raise serializers.ValidationError(
                f"{bad_vals} not valid ids for spectro configs of given datasets"
            )
        return attrs

    def get_annotation_set_name(self, target_name):
        if AnnotationSet.objects.filter(name=target_name):
            return self.get_annotation_set_name(target_name + "_1")
        return target_name

    def get_confidence_set_name(self, target_name):
        if ConfidenceIndicatorSet.objects.filter(name=target_name):
            return self.get_confidence_set_name(target_name + "_1")
        return target_name

    def create(self, validated_data):
        annotation_set = None
        confidence_indicator_set = None

        if validated_data["usage"] == AnnotationCampaignUsage.CREATE:
            annotation_set = get_object_or_404(
                AnnotationSet.objects.all(), pk=int(validated_data["annotation_set_id"])
            )
            confidence_indicator_set = get_object_or_404(
                ConfidenceIndicatorSet.objects.all(),
                pk=int(validated_data["confidence_indicator_set_id"]),
            )

        if validated_data["usage"] == AnnotationCampaignUsage.CHECK:
            # Create annotation set
            annotation_set = AnnotationSet.objects.create(
                name=self.get_annotation_set_name(validated_data["name"] + "_set"),
                desc="Annotation set for " + validated_data["name"] + " campaign",
            )
            for label in validated_data["annotation_set_labels"]:
                tag = AnnotationTag.objects.get_or_create(name=label)
                annotation_set.tags.add(tag[0])
            annotation_set.save()

            # Create confidence set
            confidence_set = ConfidenceIndicatorSet.objects.create(
                name=self.get_confidence_set_name(validated_data["name"] + "_set"),
                desc="Confidence set for " + validated_data["name"] + " campaign",
            )
            for data in validated_data["confidence_set_indicators"]:
                label = data.get(0)
                level = data.get(1)
                if label is None or level is None:
                    continue
                confidence_set.confidence_indicators.get_or_create(
                    label=label,
                    level=level,
                )
            confidence_set.save()

            # Create detectors
            for detector in validated_data["detectors"]:
                detector_name = detector.pop("detectorName")
                detector_id = None
                detector_config_id = None
                try:
                    detector_id = detector.pop("detectorId")
                    detector_config_id = detector.pop("configurationId")
                except KeyError as e:
                    print("KeyError", e)
                detector_config = detector.pop("configuration")
                d = None
                if detector_id is not None:
                    d = Detector.objects.get(pk=detector_id)
                if d is None:
                    d = Detector.objects.get_or_create(name=detector_name)[0]
                if detector_config_id is None:
                    d.configurations.create(configuration=detector_config)
                d.save()

        campaign = AnnotationCampaign(
            name=validated_data["name"],
            desc=validated_data.get("desc"),
            start=validated_data.get("start"),
            end=validated_data.get("end"),
            annotation_set_id=annotation_set.id,
            confidence_indicator_set_id=confidence_indicator_set.id
            if confidence_indicator_set is not None
            else None,
            annotation_scope=validated_data["annotation_scope"],
            usage=validated_data["usage"],
            owner_id=validated_data["owner_id"],
            instructions_url=validated_data.get("instructions_url"),
        )

        campaign.save()
        campaign.datasets.set(validated_data["datasets"])
        campaign.spectro_configs.set(validated_data["spectro_configs"])

        if validated_data["usage"] == AnnotationCampaignUsage.CHECK:
            # Create results
            for result in validated_data["results"]:
                detector = Detector.objects.filter(name=result["detector"]).first()
                detector_config = DetectorConfiguration.objects.get(
                    detector=detector, configuration=result["detector_config"]
                )
                dataset = Dataset.objects.get(name=result["dataset"])
                filename = result["dataset_file"]
                dataset_file = get_object_or_404(
                    DatasetFile, dataset=dataset, filename=filename
                )
                is_box = bool(result["is_box"])
                AnnotationResult.objects.create(
                    annotation_campaign=campaign,
                    detector_configuration=detector_config,
                    annotation_tag=AnnotationTag.objects.get(name=result["tag"]),
                    confidence_indicator=ConfidenceIndicator.objects.get(
                        label=result["confidence"],
                        confidence_indicator_set=confidence_indicator_set,
                    )
                    if "confidence" in result
                    else None,
                    start_time=result["min_time"]
                    if is_box and "min_time" in result
                    else None,
                    end_time=result["max_time"]
                    if is_box and "max_time" in result
                    else None,
                    start_frequency=result["min_frequency"]
                    if is_box and "min_frequency" in result
                    else None,
                    end_frequency=result["max_frequency"]
                    if is_box and "max_frequency" in result
                    else None,
                    dataset_file=dataset_file,
                )

        return add_annotators(
            campaign=campaign,
            goal=int(validated_data["annotation_goal"]),
            annotators=validated_data["annotators"],
        )


class AnnotationCampaignAddAnnotatorsSerializer(serializers.Serializer):
    """
    Serializer meant to update AnnotationCampaign with new annotators and corresponding tasks.

    If annotation_goal (the number of files wanted to be annotated) is not given then the whole
    dataset will be targeted.

    The parameter annotation_method is 0 for sequential and 1 for random.
    """

    annotators = serializers.ListField(
        child=serializers.IntegerField(), validators=[valid_model_ids(User)]
    )
    annotation_goal = serializers.IntegerField(min_value=1, required=False)

    def update(self, instance, validated_data):
        return add_annotators(
            campaign=instance,
            goal=int(validated_data["annotation_goal"]),
            annotators=validated_data["annotators"],
        )
