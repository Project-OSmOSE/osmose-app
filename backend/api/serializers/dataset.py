"""Dataset DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from backend.api.models import (
    Dataset,
)
from .data import SpectrogramConfigurationSerializer

DATASET_FIELDS = [
    "id",
    "name",
    "files_type",
    "start_date",
    "end_date",
    "files_count",
    "type",
    "spectros",
    "created_at",
]


class DatasetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic Dataset data"""

    files_count = serializers.IntegerField()
    type = serializers.CharField()
    spectros = SpectrogramConfigurationSerializer(many=True, source="spectro_configs")

    class Meta:
        model = Dataset
        fields = DATASET_FIELDS
        depth = 1


class SimpleSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic data"""

    class Meta:
        model = None
        fields = "__all__"
