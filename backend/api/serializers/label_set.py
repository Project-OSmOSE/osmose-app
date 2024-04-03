"""Label set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field

from backend.api.models import LabelSet


class LabelSetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic LabelSet data (with or without labels)"""

    labels = serializers.SerializerMethodField()

    class Meta:
        model = LabelSet
        fields = ["id", "name", "desc", "labels"]

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_labels(self, label_set):
        return list(label_set.labels.values_list("name", flat=True))
