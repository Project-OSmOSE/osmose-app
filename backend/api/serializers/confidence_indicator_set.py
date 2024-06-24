"""ConfidenceIndicatorSet and ConfidenceIndicator set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers
from backend.api.models import ConfidenceIndicatorSet, ConfidenceIndicator


class ConfidenceIndicatorSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicator data"""

    isDefault = serializers.BooleanField(source="is_default")

    class Meta:
        model = ConfidenceIndicator
        fields = [
            "id",
            "label",
            "level",
            "isDefault",
        ]


class ConfidenceIndicatorSetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicatorSet data"""

    confidence_indicators = ConfidenceIndicatorSerializer(many=True)

    class Meta:
        model = ConfidenceIndicatorSet
        fields = [
            "id",
            "name",
            "desc",
            "confidence_indicators",
        ]
