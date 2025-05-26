"""Annotation comment serializer"""
from rest_framework import serializers

from backend.api.models import (
    AnnotationResult,
    AnnotationComment,
    DatasetFile,
    AnnotationCampaignPhase,
)
from backend.aplose.models import User
from backend.utils.serializers import ListSerializer


class AnnotationCommentSerializer(serializers.ModelSerializer):
    """Annotation comment"""

    id = serializers.IntegerField(required=False)
    annotation_result = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationResult.objects.all(),
        allow_null=True,
        required=False,
    )
    annotation_campaign_phase = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationCampaignPhase.objects.all(),
    )
    author = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
    )
    dataset_file = serializers.PrimaryKeyRelatedField(
        queryset=DatasetFile.objects.all(),
    )

    class Meta:
        model = AnnotationComment
        fields = "__all__"
        list_serializer_class = ListSerializer
