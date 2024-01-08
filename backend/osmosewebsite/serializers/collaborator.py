"""OSmOSE Website API Serializers - Collaborator"""
from rest_framework import serializers
from backend.osmosewebsite.models import Collaborator

CollaboratorFields = [
    "id",
    "name",
    "thumbnail",
    "url",
    "show_on_home_page",
]


class CollaboratorSerializer(serializers.ModelSerializer):
    """Serializer meant to output Collaborator data"""

    class Meta:
        model = Collaborator
        fields = CollaboratorFields
