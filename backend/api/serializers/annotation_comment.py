from rest_framework import serializers

from backend.api.models import AnnotationComment
from django.db import models

from backend.utils.validators import valid_model_ids
from backend.api.models import (
    AnnotationResult,
    AnnotationTask,
)


class AnnotationCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnotationComment
        fields = "__all__"


class AnnotationCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer meant for AnnotationComment creation with corresponding result and tasks"""

    class Meta:
        model = AnnotationComment
        constraints = [
            models.UniqueConstraint(
                fields=["annotation_task_id", "annotation_result_id"],
                name="one_comment_by_annotation",
            )
        ]
        fields = ["comments", "annotation_task_id", "annotation_result_id"]

    comments = serializers.CharField(allow_blank=True, max_length=255)
    annotation_task_id = serializers.IntegerField(
        validators=[valid_model_ids(AnnotationTask)]
    )
    annotation_result_id = serializers.IntegerField(
        allow_null=True, validators=[valid_model_ids(AnnotationResult)]
    )
