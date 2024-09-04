"""ScientificTalk DRF serializers file"""
from rest_framework import serializers
from backend.osmosewebsite.models import ScientificTalk

ScientificTalkFields = [
    "id",
    "title",
    "intro",
    "date",
    "thumbnail",
    "presenter_name",
    "presenter_linkedin_url",
    "presenter_mail_address",
    "presenter_research_gate_url",
]


class ScientificTalkSerializer(serializers.ModelSerializer):
    """Serializer meant to output ScientificTalk data"""

    class Meta:
        model = ScientificTalk
        fields = ScientificTalkFields
