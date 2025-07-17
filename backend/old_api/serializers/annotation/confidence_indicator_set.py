"""ConfidenceIndicatorSet and ConfidenceIndicator set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from backend.api.models import (
    ConfidenceIndicatorSet,
    ConfidenceIndicator,
    ConfidenceIndicatorSetIndicator,
)


class ConfidenceIndicatorSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicator data"""

    confidence_indicator_set = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicatorSet.objects.all(),
        write_only=True,
    )

    class Meta:
        model = ConfidenceIndicator
        fields = "__all__"


class ConfidenceIndicatorRelationSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicator relation data"""

    confidence_indicator_set = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicatorSet.objects.all(),
        write_only=True,
    )
    confidence_indicator = serializers.PrimaryKeyRelatedField(
        queryset=ConfidenceIndicator.objects.all(),
        write_only=True,
    )
    id = serializers.PrimaryKeyRelatedField(
        source="confidence_indicator.id", read_only=True
    )
    is_default = serializers.BooleanField(default=False)
    label = serializers.CharField(source="confidence_indicator.label", read_only=True)
    level = serializers.IntegerField(
        source="confidence_indicator.level", read_only=True
    )

    class Meta:
        model = ConfidenceIndicatorSetIndicator
        fields = "__all__"


class ConfidenceIndicatorSetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicatorSet data"""

    confidence_indicators = ConfidenceIndicatorRelationSerializer(
        source="indicator_relations", many=True
    )

    class Meta:
        model = ConfidenceIndicatorSet
        fields = [
            "id",
            "name",
            "desc",
            "confidence_indicators",
        ]
