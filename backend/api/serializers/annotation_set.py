"""Annotation set DRF serializers file"""

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field

from backend.api.models import AnnotationSet

class AnnotationSetSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = AnnotationSet
        fields = ['id', 'name', 'desc', 'tags']

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_tags(self, annotation_set):
        return list(annotation_set.tags.values_list('name', flat=True))
