"""Annotation set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field

from backend.api.models import AnnotationSet


class AnnotationSetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic AnnotationSet data (with or without tags)"""

    tags = serializers.SerializerMethodField()

    class Meta:
        model = AnnotationSet
        fields = ["id", "name", "desc", "tags"]

    def __init__(self, *args, **kwargs):
        with_tags = kwargs.pop("with_tags", True)
        super().__init__(*args, **kwargs)
        if not with_tags:
            self.fields.pop("tags")

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_tags(self, annotation_set):
        return list(annotation_set.tags.values_list("name", flat=True))
