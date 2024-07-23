"""Spectrogram serializers"""
from rest_framework import serializers

from backend.api.models import SpectrogramConfiguration


class SpectrogramConfigurationSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic SpectrogramConfiguration data"""

    dataset_sr = serializers.SerializerMethodField()

    class Meta:
        model = SpectrogramConfiguration
        depth = 2
        exclude = ("dataset",)

    def get_dataset_sr(self, config: SpectrogramConfiguration) -> float:
        """Get dataset sample rate"""
        return config.dataset.audio_metadatum.dataset_sr
