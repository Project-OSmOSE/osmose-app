"""Serializer for annotation file range"""
from django.db.models import OuterRef, Subquery, F, Func
from rest_framework import serializers

from backend.api.models import (
    AnnotationFileRange,
    AnnotationTask,
    DatasetFile,
    AnnotationResult,
)
from backend.api.serializers.annotation.campaign import (
    AnnotationCampaignBasicSerializer,
)
from backend.aplose_auth.serializers import UserSerializer
from backend.utils.serializers import EnumField


class AnnotationFileRangeSerializer(serializers.ModelSerializer):
    """Serializer for annotation file range"""

    annotator = UserSerializer()
    annotation_campaign = AnnotationCampaignBasicSerializer(read_only=True)

    class Meta:
        model = AnnotationFileRange
        fields = "__all__"


class AnnotationFileRangeFinishedSerializer(AnnotationFileRangeSerializer):
    """Serializer for annotation file range with finished task count"""

    finished_count = serializers.SerializerMethodField(read_only=True)

    class Meta(AnnotationFileRangeSerializer.Meta):
        pass

    def get_finished_count(self, file_range: AnnotationFileRange) -> int:
        """Get finished task count within the range"""
        files = file_range.annotation_campaign.get_sorted_files()[
            file_range.first_file_index : file_range.last_file_index + 1
        ]
        return file_range.annotation_campaign.tasks.filter(
            annotator_id=file_range.annotator_id,
            dataset_file_id__in=files.values_list("id", flat=True),
            status=AnnotationTask.Status.FINISHED,
        ).count()


class DatasetFileSerializer(serializers.ModelSerializer):
    """Serializer for dataset file"""

    dataset_name = serializers.SlugRelatedField(
        slug_field="name", read_only=True, source="dataset"
    )

    class Meta:
        model = DatasetFile
        fields = "__all__"


class AnnotationTaskSerializer(serializers.ModelSerializer):
    """Serializer for Annotation task"""

    status = EnumField(enum=AnnotationTask.Status)
    dataset_file = DatasetFileSerializer(read_only=True)
    results_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = AnnotationTask
        exclude = ("annotation_campaign", "annotator")


class AnnotationFileRangeTasksSerializer(AnnotationFileRangeSerializer):
    """Serializer for annotation file range with detail tasks"""

    tasks = serializers.SerializerMethodField(read_only=True)

    class Meta(AnnotationFileRangeSerializer.Meta):
        pass

    def get_tasks(self, file_range: AnnotationFileRange):
        """Get finished task count within the range"""
        files = file_range.annotation_campaign.get_sorted_files()[
            file_range.first_file_index : file_range.last_file_index + 1
        ]
        result_query = (
            AnnotationResult.objects.filter(
                annotator_id=file_range.annotator_id,
                dataset_file_id=OuterRef("dataset_file_id"),
            )
            .order_by()
            .annotate(count=Func(F("id"), function="Count"))
            .values("count")
        )
        tasks = (
            file_range.annotation_campaign.tasks.filter(
                annotator_id=file_range.annotator_id,
                dataset_file_id__in=files.values_list("id", flat=True),
                annotation_campaign_id=file_range.annotation_campaign.id,
            )
            .select_related("dataset_file", "dataset_file__dataset")
            .annotate(results_count=Subquery(result_query))
        )
        return AnnotationTaskSerializer(tasks, many=True).data
