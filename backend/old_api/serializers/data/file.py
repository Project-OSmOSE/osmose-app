"""Spectrogram serializers"""
from django.utils.http import urlquote
from rest_framework import serializers

from backend import settings
from backend.api.models import DatasetFile


class DatasetFileSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic DatasetFile data"""

    dataset_sr = serializers.FloatField(read_only=True)
    audio_url = serializers.SerializerMethodField(read_only=True)
    dataset_name = serializers.SlugRelatedField(
        slug_field="name", read_only=True, source="dataset"
    )

    class Meta:
        model = DatasetFile
        exclude = ("filepath",)

    def get_audio_url(self, file: DatasetFile):
        """Get audio file URL"""
        root_url = settings.STATIC_URL + file.dataset.dataset_path
        return urlquote(f"{root_url}/{file.filepath}")
