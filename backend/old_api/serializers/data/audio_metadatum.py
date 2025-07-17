"""Spectrogram serializers"""
from rest_framework import serializers

from backend.api.models import AudioMetadatum


class AudioMetadatumSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic SpectrogramConfiguration data"""

    files_subtypes = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="name"
    )

    class Meta:
        model = AudioMetadatum
        fields = "__all__"
