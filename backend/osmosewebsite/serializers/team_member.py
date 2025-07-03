"""OSmOSE Website API Serializers - TeamMembers"""
from metadatax.common.serializers import ContactSerializer
from rest_framework import serializers

from backend.osmosewebsite.models.team_member import TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer meant to output TeamMember data"""

    contact = ContactSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = "__all__"
