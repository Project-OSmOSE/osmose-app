"""Serializer for annotation file range"""

from django.db.models import OuterRef, Subquery, F, Func, Exists
from rest_framework import serializers

from backend.api.models import (
    AnnotationFileRange,
    AnnotationTask,
    DatasetFile,
    AnnotationResult,
    AnnotationCampaign,
)
from backend.aplose_auth.models import User
from backend.utils.serializers import EnumField


class AnnotationFileRangeSerializer(serializers.ModelSerializer):
    """Serializer for annotation file range"""

    annotator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    annotation_campaign = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationCampaign.objects.all()
    )
    finished_tasks_count = serializers.SerializerMethodField(read_only=True)
    files_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = AnnotationFileRange
        fields = "__all__"

    def get_finished_tasks_count(self, file_range: AnnotationFileRange) -> int:
        """Count finished tasks within this file range"""
        return file_range.get_finished_tasks().count()

    def check_max_value(self, data: dict):
        """Check file indexes doesn't go higher than campaign has files"""
        max_value_errors = {}
        campaign: AnnotationCampaign = data["annotation_campaign"]
        max_files = campaign.get_sorted_files().count()
        if data["first_file_index"] >= max_files:
            max_value_errors = {
                **max_value_errors,
                "first_file_index": f"This field should not exceed campaigns files count ({max_files})",
            }
        if data["last_file_index"] >= max_files:
            max_value_errors = {
                **max_value_errors,
                "last_file_index": f"This field should not exceed campaigns files count ({max_files})",
            }
        if len(max_value_errors) > 0:
            raise serializers.ValidationError(
                max_value_errors,
                code="max_value",
            )

    def check_ordered_value(self, data: dict):
        """Check first file index is lower than last file index"""
        if data["first_file_index"] > data["last_file_index"]:
            raise serializers.ValidationError(
                "'last_file_index' shoud be greater or equal to 'first_file_index'",
                code="value_order",
            )

    def validate(self, attrs):
        data = super().validate(attrs)

        self.check_max_value(attrs)
        self.check_ordered_value(attrs)

        return data


class DatasetFileSerializer(serializers.ModelSerializer):
    """Serializer for dataset file"""

    dataset_name = serializers.SlugRelatedField(
        slug_field="name", read_only=True, source="dataset"
    )
    is_submitted = serializers.BooleanField()
    results_count = serializers.IntegerField(read_only=True)

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


class AnnotationFileRangeFilesSerializer(AnnotationFileRangeSerializer):
    """Serializer for annotation file range with detail files"""

    files = serializers.SerializerMethodField(read_only=True)

    class Meta(AnnotationFileRangeSerializer.Meta):
        pass

    def get_files(self, file_range: AnnotationFileRange):
        """Get files within the range"""
        files = file_range.get_files().annotate(
            is_submitted=Exists(
                AnnotationTask.objects.filter(
                    annotation_campaign_id=file_range.annotation_campaign_id,
                    annotator_id=file_range.annotator_id,
                    dataset_file_id=OuterRef("pk"),
                    status=AnnotationTask.Status.FINISHED,
                )
            ),
            results_count=Subquery(
                AnnotationResult.objects.filter(
                    annotation_campaign_id=file_range.annotation_campaign_id,
                    annotator_id=file_range.annotator_id,
                    dataset_file_id=OuterRef("pk"),
                )
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            ),
        )
        return DatasetFileSerializer(files, many=True).data
