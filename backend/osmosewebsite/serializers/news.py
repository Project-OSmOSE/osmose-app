"""Annotation task DRF serializers file"""

from rest_framework import serializers

from backend.osmosewebsite.models import News
from .team_member import TeamMemberSerializer


class NewsSerializer(serializers.ModelSerializer):
    """Serializer meant to output News data"""

    osmose_member_authors = TeamMemberSerializer(read_only=True, many=True)

    class Meta:
        model = News
        fields = ["id", "title", "intro", "body", "date", "vignette", "osmose_member_authors", "other_authors"]
