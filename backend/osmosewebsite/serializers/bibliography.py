"""Bibliography serializers"""
from rest_framework import serializers

from backend.osmosewebsite.models.bibliography import (
    BibliographyTag,
    Bibliography,
    PublicationStatus,
    PublicationType,
    Author,
)
from backend.utils.serializers import EnumField
from .scientist import InstitutionSerializer, ScientistSerializer


class AuthorSerializer(serializers.ModelSerializer):
    """Serializer meant to output Author data"""

    scientists = ScientistSerializer(many=True, read_only=True)
    institutions = InstitutionSerializer(many=True, read_only=True)

    class Meta:
        model = Author
        exclude = ("bibliography",)


class BibliographySerializer(serializers.ModelSerializer):
    """Serializer meant to output Bibliography data"""

    tags = serializers.SlugRelatedField(
        queryset=BibliographyTag.objects.all(), many=True, slug_field="name"
    )
    publication_status = EnumField(PublicationStatus)
    type = EnumField(PublicationType)

    authors = AuthorSerializer(many=True, read_only=True)

    class Meta:
        model = Bibliography
        fields = "__all__"
