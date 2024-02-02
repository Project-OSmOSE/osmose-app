"""APLOSE - Detector"""
from rest_framework import serializers
from backend.api.models import Detector

DetectorFields = [
    "id",
    "name",
    "parameters",
]


class DetectorSerializer(serializers.ModelSerializer):
    """Serializer meant to output Collaborator data"""

    class Meta:
        model = Detector
        fields = DetectorFields
