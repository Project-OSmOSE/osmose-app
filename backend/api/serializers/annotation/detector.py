"""APLOSE - Detector"""
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from backend.api.models import Detector, DetectorConfiguration

DetectorFields = [
    "id",
    "name",
    "configurations",
    # "configuration"
]


class DetectorConfigurationSerializer(serializers.ModelSerializer):
    """Serializer meant to output Collaborator data"""

    class Meta:
        model = DetectorConfiguration
        fields = [
            "id",
            "configuration",
        ]


class DetectorSerializer(serializers.ModelSerializer):
    """Serializer meant to output Collaborator data"""

    configurations = DetectorConfigurationSerializer(
        read_only=True, many=True, allow_null=True
    )
    _conf = None

    class Meta:
        model = Detector
        fields = DetectorFields
