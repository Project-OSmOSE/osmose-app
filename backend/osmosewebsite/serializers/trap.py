from rest_framework import serializers
from backend.osmosewebsite.models import Trap

TrapFields = [
    "id",
    "title",
    "intro",
    "date",
    "thumbnail",
    "presenter_linkedin_url",
    "mail_address",
    "research_gate_url",
    "presenter_lastname",
    "presenter_firstname",
]


class TrapSerializer(serializers.ModelSerializer):
    """Serializer meant to output Trap data"""

    class Meta:
        model = Trap
        fields = TrapFields
