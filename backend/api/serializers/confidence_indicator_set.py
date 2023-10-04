"""Annotation set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers
from backend.api.models import ConfidenceIndicatorSet, ConfidenceIndicator


class ConfidenceIndicatorSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicatorSet data"""

    class Meta:
        model = ConfidenceIndicator
        fields = [
            "id",
            "label",
            "level",
        ]


class ConfidenceIndicatorSetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicatorSet data"""

    confidenceIndicators = ConfidenceIndicatorSerializer(
        many=True, source="confidence_indicators"
    )
    defaultConfidenceIndicator = ConfidenceIndicatorSerializer(
        many=True, source="default_confidence_indicator"
    )

    class Meta:
        model = ConfidenceIndicatorSet
        fields = [
            "id",
            "name",
            "desc",
            "confidenceIndicators",
            "defaultConfidenceIndicator",
        ]
