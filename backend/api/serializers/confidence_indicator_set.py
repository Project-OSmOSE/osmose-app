"""ConfidenceIndicatorSet and ConfidenceIndicator set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers
from backend.api.models import ConfidenceIndicatorSet, ConfidenceIndicator


class ConfidenceIndicatorSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicator data"""

    isDefault = serializers.BooleanField(source="is_default", read_only=True)
    confidence_indicator_set = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicatorSet.objects.all(),
        write_only=True,
    )

    class Meta:
        model = ConfidenceIndicator
        fields = "__all__"


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
