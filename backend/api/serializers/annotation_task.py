"""Annotation task DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from datetime import datetime

from django.conf import settings
from django.utils.http import urlquote
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from backend.api.models import (
    AnnotationTask,
    AnnotationResult,
    SpectroConfig,
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
from .utils import EnumField


class AnnotationTaskSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic AnnotationTask data"""

    filename = serializers.CharField()
    dataset_name = serializers.CharField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()

    class Meta:
        model = AnnotationTask
        fields = ["id", "status", "filename", "dataset_name", "start", "end"]


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

    def __init__(self, *args, **kwargs):
        if "user_id" in kwargs:
            self.user_id = kwargs.pop("user_id")
        super().__init__(*args, **kwargs)

    @extend_schema_field(DetectorSerializer(allow_null=True))
    def get_detector(self, result):
        # type: (AnnotationResult) -> any
        if result.detector_configuration is None:
            return None
        return DetectorSerializer(
            result.detector_configuration.detector,
            configuration=result.detector_configuration,
        ).data

    @extend_schema_field(serializers.BooleanField(allow_null=True))
    def get_validation(self, result):
        # type: (AnnotationResult) -> bool | None
        if result.annotation_campaign.usage == AnnotationCampaignUsage.CREATE:
            return None
        if self.user_id is None:
            return None
        validation = result.validations.filter(annotator_id=self.user_id)
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


class AnnotationTaskSpectroSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output basic SpectroConfig data

    It is used for spectroUrls field AnnotationTaskRetrieveSerializer
    """

    winsize = serializers.IntegerField(source="window_size")
    urls = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        if "dataset_file" in kwargs:
            self.dataset_file = kwargs.pop("dataset_file")
        super().__init__(*args, **kwargs)

    class Meta:
        model = SpectroConfig
        fields = ["nfft", "winsize", "overlap", "urls"]

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_urls(self, spectro_config):
        """This returns urls for spectrogram zoom tiles"""
        root_url = settings.STATIC_URL + self.dataset_file.dataset.dataset_path
        sound_name = self.dataset_file.filepath.split("/")[-1].replace(".wav", "")
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
        if "user_id" in kwargs:
            self.user_id = kwargs.pop("user_id")
        super().__init__(*args, **kwargs)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_labels(self, task):
        # type:(AnnotationTask) -> list[str]
        return list(
            task.annotation_campaign.annotation_set.labels.values_list(
                "name", flat=True
            )
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
            "startTime": task.dataset_file.audio_metadatum.start,
            "endTime": task.dataset_file.audio_metadatum.end,
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
    def get_prevAnnotations(self, task):
        # type:(AnnotationTask) -> any
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
            queryset, many=True, user_id=self.user_id
        ).data

    def get_prevAndNextAnnotation(self, task):
        # type:(AnnotationTask) -> {"prev": int, "next": int}
        qs_list = list(
            AnnotationTask.objects.all()
            .filter(
                annotation_campaign=task.annotation_campaign.id,
                annotator=task.annotator.id,
            )
            .prefetch_related("dataset_file__audio_metadatum")
            .order_by("dataset_file__audio_metadatum__start", "id")
            .values_list("id", flat=True)
        )
        currentKey = qs_list.index(task.id)
        prevId = ""
        nextId = ""
        if currentKey > 0:
            prevId = qs_list[currentKey - 1]
        if currentKey < len(qs_list) - 1:
            nextId = qs_list[currentKey + 1]
        return {"prev": prevId, "next": nextId}

    @extend_schema_field(AnnotationCommentSerializer(many=True))
    def get_taskComment(self, task):
        print("get_taskComment", task.task_comment)
        return AnnotationCommentSerializer(task.task_comment, many=True).data


class AnnotationTaskUpdateSerializer(serializers.Serializer):
    """This serializer is responsible for updating a task with new results from the annotator"""

    annotations = AnnotationTaskUpdateResultSerializer(many=True)
    task_start_time = serializers.IntegerField()
    task_end_time = serializers.IntegerField()

    def validate_annotations(self, annotations):
        """Validates that annotations correspond to annotation set labels and set confidence indicator"""
        print("validation in progress", annotations)
        set_labels = set(
            self.instance.annotation_campaign.annotation_set.labels.values_list(
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
                f"{unknown_labels} not valid labels from annotation set {set_labels}."
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
                instance.annotation_campaign.annotation_set.labels.values_list(
                    "id", "name"
                ),
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
            print(validated_data["annotations"])
            for annotation in validated_data["annotations"]:
                print(annotation)
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

        instance.status = 2
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
