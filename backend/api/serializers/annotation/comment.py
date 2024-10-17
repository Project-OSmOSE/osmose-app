"""Annotation comment serializer"""
from rest_framework import serializers

from backend.api.models import (
    AnnotationResult,
    AnnotationCampaign,
    AnnotationComment,
    DatasetFile,
)
from backend.aplose_auth.models import User
from backend.utils.serializers import ListSerializer


class AnnotationCommentSerializer(serializers.ModelSerializer):
    """Annotation comment"""

    id = serializers.IntegerField(required=False)
    annotation_result = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationResult.objects.all(),
        allow_null=True,
        required=False,
    )
    annotation_campaign = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationCampaign.objects.all(),
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
