"""Dataset DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from backend.api.models import Dataset, SpectroConfig, WindowType, AudioMetadatum


class AudioMetadatumSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic AudioMetadatum data"""

    class Meta:
        model = AudioMetadatum
        fields = "__all__"


class WindowTypeSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic WindowType data"""

    class Meta:
        model = WindowType
        fields = "__all__"


class SpectroConfigSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic SpectroConfig data"""

    window_type = WindowTypeSerializer()
    dataset_sr = serializers.SerializerMethodField()

    class Meta:
        model = SpectroConfig
        # fields = "__all__"
        exclude = ("dataset",)

    def get_dataset_sr(self, config: SpectroConfig) -> float:
        """Get dataset sample rate"""
        return config.dataset.audio_metadatum.dataset_sr


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
