"""Dataset DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from backend.api.models import Dataset, SpectroConfig


class SpectroConfigSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic SpectroConfig data"""

    class Meta:
        model = SpectroConfig
        fields = "__all__"


class DatasetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic Dataset data"""

    files_count = serializers.IntegerField()
    type = serializers.CharField()
    spectros = SpectroConfigSerializer(many=True, source="spectro_configs")

    class Meta:
        model = Dataset
        fields = [
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
        depth = 1
