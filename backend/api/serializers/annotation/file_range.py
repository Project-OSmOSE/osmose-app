"""Serializer for annotation file range"""
from rest_framework import serializers

from backend.api.models import AnnotationFileRange, AnnotationTask
from backend.api.serializers.annotation.campaign import (
    AnnotationCampaignBasicSerializer,
)
from backend.aplose_auth.serializers import UserSerializer


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
