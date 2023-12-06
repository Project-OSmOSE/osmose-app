"""Project DRF serializers file"""

from rest_framework import serializers

from backend.osmosewebsite.models import Project
from .team_member import TeamMemberSerializer
from .collaborator import CollaboratorSerializer


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer meant to output Project data"""

    contact = TeamMemberSerializer(read_only=True, many=True)
    collaborators = CollaboratorSerializer(read_only=True, many=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "intro",
            "start",
            "end",
            "body",
            "thumbnail",
            "contact",
            "collaborators",
        ]
