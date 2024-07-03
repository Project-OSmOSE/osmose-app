from rest_framework import serializers
from backend.osmosewebsite.models import Trap
from .team_member import TeamMemberSerializer

TrapFields = [
    "id",
    "title",
    "intro",
    "date",
    "thumbnail",
    "linkedin_url",
    "mail_address",
    "research_gate_url",
    "osmose_member_authors",
    "lastname",
    "firstname",
]


class TrapSerializer(serializers.ModelSerializer):
    """Serializer meant to output Trap data"""

    class Meta:
        model = Trap
        fields = TrapFields
