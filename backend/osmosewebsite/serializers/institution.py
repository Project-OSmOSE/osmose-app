"""Scientist serializers"""
from metadatax.common.models import Institution
from rest_framework import serializers


class InstitutionSerializer(serializers.ModelSerializer):
    """Institution serializer"""

    class Meta:
        model = Institution
        fields = "__all__"
