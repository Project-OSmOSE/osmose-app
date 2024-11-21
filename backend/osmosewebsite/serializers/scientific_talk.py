"""ScientificTalk DRF serializers file"""
from rest_framework import serializers

from backend.osmosewebsite.models import ScientificTalk
from .team_member import TeamMemberSerializer

ScientificTalkFields = [
    "id",
    "title",
    "intro",
    "date",
    "thumbnail",
    "osmose_member_presenters",
    "other_presenters",
]


class ScientificTalkSerializer(serializers.ModelSerializer):
    """Serializer meant to output ScientificTalk data"""

    osmose_member_presenters = TeamMemberSerializer(read_only=True, many=True)

    class Meta:
        model = ScientificTalk
        fields = ScientificTalkFields
