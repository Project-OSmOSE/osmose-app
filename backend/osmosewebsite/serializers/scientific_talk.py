"""ScientificTalk DRF serializers file"""
from rest_framework import serializers

from backend.osmosewebsite.models import ScientificTalk

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

    class Meta:
        model = ScientificTalk
        fields = ScientificTalkFields
