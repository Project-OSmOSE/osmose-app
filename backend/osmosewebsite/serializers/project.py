"""Project DRF serializers file"""

from rest_framework import serializers
from metadatax.serializers.acquisition import (
    DeploymentSerializerWithChannel,
    ProjectSerializer as SourceMetadataxProjectSerializer,
)
from backend.osmosewebsite.models import Project
from .team_member import TeamMemberSerializer
from .collaborator import CollaboratorSerializer

ProjectFields = [
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


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer meant to output Project data"""

    contact = TeamMemberSerializer(read_only=True, many=True)
    collaborators = CollaboratorSerializer(read_only=True, many=True)

    class Meta:
        model = Project
        fields = ProjectFields


class MetadataxProjectSerializer(SourceMetadataxProjectSerializer):
    """Override Serializer for Metadatax Project"""

    website_project = serializers.PrimaryKeyRelatedField(read_only=True)


class DeploymentSerializer(DeploymentSerializerWithChannel):
    """Add project to basic Deployment serializer"""

    project = MetadataxProjectSerializer()
