"""Label set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from backend.api.models import LabelSet, Label


class LabelSetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic LabelSet data (with or without labels)"""

    labels = serializers.SlugRelatedField(
        many=True, queryset=Label.objects.all(), slug_field="name"
    )

    class Meta:
        model = LabelSet
        fields = ["id", "name", "desc", "labels"]
