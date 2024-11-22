"""Project DRF serializers file"""

from metadatax.serializers.acquisition import (
    DeploymentSerializerWithChannel,
    ProjectSerializer as SourceMetadataxProjectSerializer,
)
from rest_framework import serializers

from backend.osmosewebsite.models import Project
from .collaborator import CollaboratorSerializer
from .team_member import TeamMemberSerializer

ProjectFields = [
    "id",
    "title",
    "intro",
    "start",
    "end",
    "body",
    "thumbnail",
    "osmose_member_contacts",
    "other_contacts",
    "collaborators",
]


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer meant to output Project data"""

    osmose_member_contacts = TeamMemberSerializer(read_only=True, many=True)
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
