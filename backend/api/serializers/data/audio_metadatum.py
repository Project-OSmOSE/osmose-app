"""Spectrogram serializers"""
from rest_framework import serializers

from backend.api.models import AudioMetadatum


class AudioMetadatumSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic SpectrogramConfiguration data"""

    class Meta:
        model = AudioMetadatum
        fields = "__all__"
