from rest_framework import serializers
from backend.osmosewebsite.models.team_member import TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer meant to output TeamMember data"""

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "name",
            "position",
            "biography",
            "picture",
            "mailAddress",
            "researchGateURL",
            "personalWebsiteURL",
            "githubURL",
            "linkedinURL",
            "isFormerMember",
        ]
