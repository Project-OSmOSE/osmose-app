"""Annotation task DRF serializers file"""

from rest_framework import serializers

from backend.osmosewebsite.models import News
from .team_member import TeamMemberSerializer

NewsFields = [
    "id",
    "title",
    "intro",
    "body",
    "date",
    "thumbnail",
    "osmose_member_authors",
    "other_authors",
]


class NewsSerializer(serializers.ModelSerializer):
    """Serializer meant to output News data"""

    osmose_member_authors = TeamMemberSerializer(read_only=True, many=True)

    class Meta:
        model = News
        fields = NewsFields
