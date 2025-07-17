"""Spectrogram serializers"""
from django.utils.http import urlquote
from rest_framework import serializers

from backend import settings
from backend.api.models import SpectrogramConfiguration


class SpectrogramConfigurationSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic SpectrogramConfiguration data"""

    folder_path = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SpectrogramConfiguration
        depth = 2
        exclude = ("dataset",)

    def get_folder_path(self, configuration: SpectrogramConfiguration) -> str:
        """Recover spectrogram configuration folder path"""
        root_url = settings.STATIC_URL + configuration.dataset.dataset_path
        dataset_conf = configuration.dataset.dataset_conf or ""
        spectro_path = (
            settings.DATASET_SPECTRO_FOLDER / dataset_conf / configuration.name
        )
        return urlquote(f"{root_url}/{spectro_path}/image")
