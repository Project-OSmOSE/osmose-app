"""Scientist serializers"""
from rest_framework import serializers

from backend.osmosewebsite.models import Scientist, Institution


class InstitutionSerializer(serializers.ModelSerializer):
    """Institution serializer"""

    class Meta:
        model = Institution
        fields = "__all__"


class ScientistSerializer(serializers.ModelSerializer):
    """Scientist serializer"""

    institutions = InstitutionSerializer(many=True, read_only=True)

    full_name = serializers.SerializerMethodField(read_only=True)
    short_name = serializers.CharField(read_only=True)

    class Meta:
        model = Scientist
        fields = "__all__"

    def get_full_name(self, obj: Scientist) -> str:
        """Return scientist long name"""
        return obj.__str__()
