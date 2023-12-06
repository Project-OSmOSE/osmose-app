"""OSmOSE Website API Serializers - TeamMembers"""
from rest_framework import serializers
from backend.osmosewebsite.models.team_member import TeamMember

TeamMemberFields = [
    "id",
    "name",
    "position",
    "biography",
    "picture",
    "mail_address",
    "research_gate_url",
    "personal_website_url",
    "github_url",
    "linkedin_url",
    "is_former_member",
]


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer meant to output TeamMember data"""

    class Meta:
        model = TeamMember
        fields = TeamMemberFields
