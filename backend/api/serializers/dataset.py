"""Dataset DRF serializers file"""
from metadatax.serializers.acquisition import ChannelConfigurationSerializer
from rest_framework import serializers

from backend.api.models import (
    Dataset,
)
from .data import SpectrogramConfigurationSerializer

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

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
    "related_channel_configuration",
]


class DatasetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic Dataset data"""

    files_count = serializers.IntegerField()
    type = serializers.SlugRelatedField(read_only=True, slug_field="dataset_type__name")
    spectros = SpectrogramConfigurationSerializer(many=True, source="spectro_configs")
    related_channel_configuration = ChannelConfigurationSerializer(many=True)

    class Meta:
        model = Dataset
        fields = DATASET_FIELDS
        depth = 1


class SimpleSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic data"""

    class Meta:
        model = None
        fields = "__all__"
