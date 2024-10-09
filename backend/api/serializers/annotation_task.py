"""Annotation task DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from datetime import datetime
from typing import Optional

from django.conf import settings
from django.utils.http import urlquote
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from backend.api.models import (
    AnnotationTask,
    AnnotationResult,
    SpectrogramConfiguration,
    AnnotationComment,
    AnnotationCampaignUsage,
    AnnotationResultValidation,
)
from backend.api.serializers.annotation import (
    DetectorSerializer,
)
from backend.api.serializers.annotation_comment import (
    AnnotationCommentSerializer,
)
from backend.api.serializers.confidence_indicator_set import (
    ConfidenceIndicatorSetSerializer,
)
from backend.utils.serializers import EnumField


class AnnotationTaskSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic AnnotationTask data"""

    filename = serializers.CharField()
    dataset_name = serializers.CharField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    results_count = serializers.IntegerField()
    status = EnumField(enum=AnnotationTask.Status)

    class Meta:
        model = AnnotationTask
        fields = [
            "id",
            "status",
            "filename",
            "dataset_name",
            "start",
            "end",
            "results_count",
        ]


class AnnotationTaskBoundarySerializer(serializers.Serializer):
    """Serializer meant to output DatasetFile boundary data"""

    startTime = serializers.DateTimeField()
    endTime = serializers.DateTimeField()
    startFrequency = serializers.FloatField()
    endFrequency = serializers.FloatField()


class AnnotationTaskResultSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output basic AnnotationResult data

    It is used for prevAnnotations field AnnotationTaskRetrieveSerializer
    """

    id = serializers.IntegerField(allow_null=True)
    label = serializers.CharField(source="label.name")
    startTime = serializers.FloatField(source="start_time", allow_null=True)
    endTime = serializers.FloatField(source="end_time", allow_null=True)
    startFrequency = serializers.FloatField(source="start_frequency", allow_null=True)
    endFrequency = serializers.FloatField(source="end_frequency", allow_null=True)
    confidenceIndicator = serializers.CharField(
        source="confidence_indicator", allow_null=True
    )
    result_comments = AnnotationCommentSerializer(many=True, allow_null=True)
    detector = serializers.SerializerMethodField()
    validation = serializers.SerializerMethodField()

    class Meta:
        model = AnnotationResult
        fields = [
            "id",
            "label",
            "startTime",
            "endTime",
            "startFrequency",
            "endFrequency",
            "confidenceIndicator",
            "result_comments",
            "detector",
            "validation",
        ]

    @extend_schema_field(DetectorSerializer(allow_null=True))
    def get_detector(self, result: AnnotationResult):
        if result.detector_configuration is None:
            return None
        return DetectorSerializer(
            result.detector_configuration.detector,
            configuration=result.detector_configuration,
        ).data

    @extend_schema_field(serializers.BooleanField(allow_null=True))
    def get_validation(self, result) -> Optional[bool]:
        if result.annotation_campaign.usage == AnnotationCampaignUsage.CREATE:
            return None
        if self.context["user_id"] is None:
            return None
        validation = result.validations.filter(annotator_id=self.context["user_id"])
        if not validation.exists():
            return None
        return validation.first().is_valid


class AnnotationTaskUpdateResultSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output basic AnnotationResult data

    It is used for prevAnnotations field AnnotationTaskRetrieveSerializer
    """

    id = serializers.IntegerField(allow_null=True, required=False)
    label = serializers.CharField(source="label.name")
    startTime = serializers.FloatField(source="start_time", allow_null=True)
    endTime = serializers.FloatField(source="end_time", allow_null=True)
    startFrequency = serializers.FloatField(source="start_frequency", allow_null=True)
    endFrequency = serializers.FloatField(source="end_frequency", allow_null=True)
    confidenceIndicator = serializers.CharField(
        source="confidence_indicator", allow_null=True
    )
    result_comments = AnnotationCommentSerializer(many=True, allow_null=True)
    validation = serializers.BooleanField(required=False)

    class Meta:
        model = AnnotationResult
        fields = [
            "id",
            "label",
            "startTime",
            "endTime",
            "startFrequency",
            "endFrequency",
            "confidenceIndicator",
            "result_comments",
            "validation",
        ]


AnnotationTaskSpectroSerializerFields = [
    "id",
    "nfft",
    "winsize",
    "overlap",
    "urls",
    "linear_frequency_scale",
    "multi_linear_frequency_scale",
]


class AnnotationTaskSpectroSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output basic SpectrogramConfiguration data

    It is used for spectroUrls field AnnotationTaskRetrieveSerializer
    """

    winsize = serializers.IntegerField(source="window_size")
    urls = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        if "dataset_file" in kwargs:
            self.dataset_file = kwargs.pop("dataset_file")
        super().__init__(*args, **kwargs)

    class Meta:
        model = SpectrogramConfiguration
        fields = AnnotationTaskSpectroSerializerFields
        depth = 2

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_urls(self, spectro_config: SpectrogramConfiguration):
        """This returns urls for spectrogram zoom tiles"""
        root_url = settings.STATIC_URL + self.dataset_file.dataset.dataset_path
        sound_name = (
            self.dataset_file.filepath.replace("\\", "/")
            .split("/")[-1]
            .replace(".wav", "")
        )
        dataset_conf = self.dataset_file.dataset.dataset_conf or ""
        spectro_path = (
            settings.DATASET_SPECTRO_FOLDER / dataset_conf / spectro_config.name
        )
        return [
            urlquote(f"{root_url}/{spectro_path}/image/{tile}")
            for tile in spectro_config.zoom_tiles(sound_name)
        ]


class AnnotationTaskRetrieveSerializer(serializers.Serializer):
    """Serializer meant to return the input needed for the AudioAnnotator to process AnnotationTask"""

    # This class uses legacy method names for backward-compatibility
    # pylint: disable=invalid-name
    id = serializers.IntegerField()
    campaignId = serializers.IntegerField(source="annotation_campaign_id")
    campaignName = serializers.CharField(source="annotation_campaign.name")
    labels = serializers.SerializerMethodField()
    boundaries = serializers.SerializerMethodField()
    audioUrl = serializers.SerializerMethodField()
    audioRate = serializers.SerializerMethodField()
    spectroUrls = serializers.SerializerMethodField()
    prevAnnotations = serializers.SerializerMethodField()
    annotationScope = serializers.IntegerField(
        source="annotation_campaign.annotation_scope"
    )
    prevAndNextAnnotation = serializers.SerializerMethodField()
    taskComment = serializers.SerializerMethodField()
    confidenceIndicatorSet = ConfidenceIndicatorSetSerializer(
        source="annotation_campaign.confidence_indicator_set"
    )
    mode = EnumField(enum=AnnotationCampaignUsage, source="annotation_campaign.usage")
    instructions_url = serializers.CharField(
        source="annotation_campaign.instructions_url"
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_labels(self, task: AnnotationTask) -> list[str]:
        return list(
            task.annotation_campaign.label_set.labels.values_list("name", flat=True)
        )

    @extend_schema_field(ConfidenceIndicatorSetSerializer)
    def get_confidenceIndicatorSet(self, task):
        # type:(AnnotationTask) -> any
        return ConfidenceIndicatorSetSerializer(
            task.annotation_campaign.confidence_indicator_set
        ).data

    @extend_schema_field(AnnotationTaskBoundarySerializer)
    def get_boundaries(self, task):
        # type:(AnnotationTask) -> dict
        return {
            "startTime": task.dataset_file.start,
            "endTime": task.dataset_file.end,
            "startFrequency": 0,
            "endFrequency": task.dataset_file.dataset_sr / 2,
        }

    @extend_schema_field(serializers.CharField())
    def get_audioUrl(self, task):  # pylint: disable=invalid-name
        # type:(AnnotationTask) -> str
        root_url = settings.STATIC_URL + task.dataset_file.dataset.dataset_path
        return f"{root_url}/{task.dataset_file.filepath}"

    @extend_schema_field(serializers.IntegerField())
    def get_audioRate(self, task):
        # type:(AnnotationTask) -> float
        return task.dataset_file.dataset_sr

    @extend_schema_field(AnnotationTaskSpectroSerializer(many=True))
    def get_spectroUrls(self, task):
        # type:(AnnotationTask) -> any
        spectros_configs = set(task.dataset_file.dataset.spectro_configs.all()) & set(
            task.annotation_campaign.spectro_configs.all()
        )
        return AnnotationTaskSpectroSerializer(
            spectros_configs, many=True, dataset_file=task.dataset_file
        ).data

    @extend_schema_field(AnnotationTaskResultSerializer(many=True))
    def get_prevAnnotations(self, task: AnnotationTask):
        queryset = AnnotationResult.objects.filter(
            annotation_campaign_id=task.annotation_campaign_id,
            dataset_file_id=task.dataset_file_id,
        )
        if task.annotation_campaign.usage == AnnotationCampaignUsage.CREATE:
            queryset = queryset.filter(
                annotator_id=task.annotator_id,
            )

        queryset = queryset.prefetch_related(
            "label",
            "confidence_indicator",
            "result_comments",
            "validations",
            "detector_configuration",
            "detector_configuration__detector",
        )
        return AnnotationTaskResultSerializer(
            queryset, many=True, context=self.context
        ).data

    def get_prevAndNextAnnotation(self, task):
        # type:(AnnotationTask) -> {"prev": int, "next": int}
        task_ids = list(
            AnnotationTask.objects.all()
            .filter(
                annotation_campaign=task.annotation_campaign.id,
                annotator=task.annotator.id,
            )
            .prefetch_related("dataset_file")
            .values_list("id", flat=True)
        )
        currentKey = task_ids.index(task.id)
        prevId = ""
        nextId = ""
        if currentKey > 0:
            prevId = task_ids[currentKey - 1]
        if currentKey < len(task_ids) - 1:
            nextId = task_ids[currentKey + 1]
        return {
            "prev": AnnotationTask.objects.get(pk=prevId).dataset_file_id
            if prevId
            else "",
            "next": AnnotationTask.objects.get(pk=nextId).dataset_file_id
            if nextId
            else "",
        }

    @extend_schema_field(AnnotationCommentSerializer(many=True))
    def get_taskComment(self, task):
        return AnnotationCommentSerializer(task.task_comments, many=True).data


class AnnotationTaskUpdateSerializer(serializers.Serializer):
    """This serializer is responsible for updating a task with new results from the annotator"""

    annotations = AnnotationTaskUpdateResultSerializer(many=True)
    task_start_time = serializers.IntegerField()
    task_end_time = serializers.IntegerField()

    def validate_annotations(self, annotations):
        """Validates that annotations correspond to label set labels and set confidence indicator"""
        set_labels = set(
            self.instance.annotation_campaign.label_set.labels.values_list(
                "name", flat=True
            )
        )

        if isinstance(annotations, list):
            update_labels = set(ann["label"]["name"] for ann in annotations)
        else:
            update_labels = {annotations["label"]["name"]}

        unknown_labels = update_labels - set_labels
        if unknown_labels:
            raise serializers.ValidationError(
                f"{unknown_labels} not valid labels from label set {set_labels}."
            )

        if self.instance.annotation_campaign.confidence_indicator_set:
            set_confidence_indicators = set(
                self.instance.annotation_campaign.confidence_indicator_set.confidence_indicators.values_list(
                    "label", flat=True
                )
            )

            update_confidence_indicators = set(
                ann["confidence_indicator"] for ann in annotations
            )
            unknown_confidence_indicators = (
                update_confidence_indicators - set_confidence_indicators
            )
            if unknown_confidence_indicators:
                raise serializers.ValidationError(
                    f"{unknown_confidence_indicators} not valid confidence indicator"
                    + f"from confidence indicator set {set_confidence_indicators}."
                )

        return annotations

    def _create_comments(self, comments_data, result, task):
        if comments_data is not None:
            for comment_data in comments_data:
                comment_data.pop("annotation_result")
                comment_data.pop("annotation_task")
                comment = AnnotationComment.objects.create(
                    annotation_result=result,
                    annotation_task=task,
                    **comment_data,
                )
                result.result_comments.set([comment])

    def _create_results(self, instance, validated_data):
        # type:(AnnotationTask, any) -> AnnotationTask
        """The update of an AnnotationTask will delete previous results and add new ones (new annotations)."""

        labels = dict(
            map(
                reversed,
                instance.annotation_campaign.label_set.labels.values_list("id", "name"),
            )
        )

        confidence_indicators = {}
        if instance.annotation_campaign.confidence_indicator_set:
            confidence_indicators = dict(
                map(
                    reversed,
                    instance.annotation_campaign.confidence_indicator_set.confidence_indicators.values_list(
                        "id", "label"
                    ),
                )
            )

        for annotation in validated_data["annotations"]:
            comments_data = annotation.pop("result_comments")
            annotation["label_id"] = labels[annotation.pop("label")["name"]]

            # We don't necessarily have confidence indicators so here let's just use "get"
            annotation["confidence_indicator_id"] = confidence_indicators.get(
                annotation.pop("confidence_indicator")
            )
            new_result = AnnotationResult.objects.create(
                dataset_file_id=instance.dataset_file_id,
                annotation_campaign_id=instance.annotation_campaign_id,
                annotator_id=instance.annotator_id,
                **annotation,
            )

            self._create_comments(
                comments_data=comments_data, result=new_result, task=instance
            )

        return instance

    def update(self, instance, validated_data):
        # type:(AnnotationTask, any) -> AnnotationTask
        """The update of an AnnotationTask and change status."""
        if instance.annotation_campaign.usage == AnnotationCampaignUsage.CREATE:
            AnnotationResult.objects.filter(
                annotation_campaign_id=instance.annotation_campaign_id,
                annotator_id=instance.annotator_id,
                dataset_file_id=instance.dataset_file_id,
            ).delete()
            instance = self._create_results(instance, validated_data)
        else:
            AnnotationResultValidation.objects.filter(
                annotator_id=instance.annotator_id,
                result__annotation_campaign_id=instance.annotation_campaign_id,
                result__dataset_file_id=instance.dataset_file_id,
            ).delete()
            for annotation in validated_data["annotations"]:
                result = AnnotationResult.objects.get(pk=int(annotation.pop("id")))
                AnnotationResultValidation.objects.create(
                    is_valid=bool(annotation.pop("validation")),
                    annotator_id=instance.annotator_id,
                    result=result,
                )
                comments_data = annotation.pop("result_comments")
                self._create_comments(
                    comments_data=comments_data, result=result, task=instance
                )

        instance.sessions.create(
            start=datetime.fromtimestamp(validated_data["task_start_time"]),
            end=datetime.fromtimestamp(validated_data["task_end_time"]),
            session_output=validated_data,
        )

        instance.status = AnnotationTask.Status.FINISHED
        instance.save()

        return instance


class AnnotationTaskOneResultUpdateSerializer(AnnotationTaskUpdateSerializer):
    """This serializer is responsible for updating a task with a new result from the annotator
    The status of this task will stay started.
    """

    def update(self, instance, validated_data):
        # type:(AnnotationTask, any) -> AnnotationTask
        instance = self._create_results(instance, validated_data)

        return instance


class AnnotationTaskUpdateOutputCampaignSerializer(serializers.Serializer):
    """
    Serializer class meant for the output of an AnnotationTask update.

    It indicates to the AudioAnnotator what is the next task and/or current campaign_id.
    """

    next_task = serializers.IntegerField(allow_null=True)
    campaign_id = serializers.IntegerField(allow_null=True)
