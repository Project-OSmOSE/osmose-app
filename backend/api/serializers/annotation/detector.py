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

    configurations = serializers.SerializerMethodField()
    _conf = None

    class Meta:
        model = Detector
        fields = DetectorFields

    def __init__(self, *args, **kwargs):
        if "configuration" in kwargs:
            self._conf = kwargs.pop("configuration")
        super().__init__(*args, **kwargs)

    @extend_schema_field(DetectorConfigurationSerializer(many=True, allow_null=True))
    def get_configurations(self, detector):
        """Get configuration for detector"""
        if self._conf is None:
            return DetectorConfigurationSerializer(
                detector.configurations, many=True
            ).data
        return DetectorConfigurationSerializer(
            [
                self._conf,
            ],
            many=True,
        ).data
