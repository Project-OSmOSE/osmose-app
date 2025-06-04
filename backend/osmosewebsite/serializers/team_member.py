"""OSmOSE Website API Serializers - TeamMembers"""
from rest_framework import serializers

from backend.osmosewebsite.models.team_member import TeamMember
from .scientist import ScientistSerializer


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer meant to output TeamMember data"""

    scientist = ScientistSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = "__all__"
