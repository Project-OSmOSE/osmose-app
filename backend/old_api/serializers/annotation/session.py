"""Annotation session serializer"""
from rest_framework import serializers

from backend.api.models import (
    AnnotationSession,
    AnnotationTask,
)


class AnnotationSessionSerializer(serializers.ModelSerializer):
    """Annotation session serializer"""

    annotation_task = serializers.PrimaryKeyRelatedField(
        queryset=AnnotationTask.objects.all()
    )

    class Meta:
        model = AnnotationSession
        fields = "__all__"
