"""TRAP DRF serializers file"""
from rest_framework import serializers
from backend.osmosewebsite.models import Trap

TrapFields = [
    "id",
    "title",
    "intro",
    "date",
    "thumbnail",
    "presenter_linkedin_url",
    "presenter_mail_address",
    "presenter_research_gate_url",
    "presenter_lastname",
    "presenter_firstname",
]


class TrapSerializer(serializers.ModelSerializer):
    """Serializer meant to output Trap data"""

    class Meta:
        model = Trap
        fields = TrapFields
