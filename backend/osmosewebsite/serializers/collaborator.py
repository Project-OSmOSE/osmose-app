"""OSmOSE Website API Serializers - Collaborator"""
from rest_framework import serializers
from backend.osmosewebsite.models import Collaborator


class CollaboratorSerializer(serializers.ModelSerializer):
    """Serializer meant to output Collaborator data"""

    class Meta:
        model = Collaborator
        fields = [
            "id",
            "name",
            "thumbnail",
            "show_on_home_page",
            "level",
        ]
