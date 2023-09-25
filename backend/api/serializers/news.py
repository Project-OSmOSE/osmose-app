"""Annotation task DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from backend.api.models import (News)

class NewsSerializer(serializers.ModelSerializer):
    """Serializer meant to output News data"""

    class Meta:
        model = News
        fields = ["title", "body"]

class NewsRetrieveSerializer(serializers.ModelSerializer):
    """Retrieve a news to the corresponding id"""

    class Meta:
        model = News
        fields = [
            "id",
            "title",
            "body",
        ]