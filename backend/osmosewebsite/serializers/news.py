"""Annotation task DRF serializers file"""

from rest_framework import serializers

from backend.osmosewebsite.models import News


class NewsSerializer(serializers.ModelSerializer):
    """Serializer meant to output News data"""

    class Meta:
        model = News
        fields = ["id", "title", "intro", "body", "date", "vignette"]
