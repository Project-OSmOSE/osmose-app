"""Bibliography serializers"""
from metadatax.bibliography.models import (
    Tag,
    Bibliography,
    BibliographySoftware,
    BibliographyArticle,
    BibliographyConference,
    BibliographyPoster,
    Author,
)
from metadatax.common.serializers import ContactSerializer
from rest_framework import serializers

from backend.utils.serializers import EnumField
from .institution import InstitutionSerializer


class AuthorSerializer(serializers.ModelSerializer):
    """Serializer meant to output Author data"""

    contact = ContactSerializer(read_only=True)
    institutions = InstitutionSerializer(many=True, read_only=True)

    class Meta:
        model = Author
        exclude = ("bibliography",)


class BibliographySoftwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = BibliographySoftware
        fields = "__all__"


class BibliographyArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BibliographyArticle
        fields = "__all__"


class BibliographyConferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BibliographyConference
        fields = "__all__"


class BibliographyPosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BibliographyPoster
        fields = "__all__"


class BibliographySerializer(serializers.ModelSerializer):
    """Serializer meant to output Bibliography data"""

    tags = serializers.SlugRelatedField(
        queryset=Tag.objects.all(), many=True, slug_field="name"
    )
    status = EnumField(Bibliography.Status)
    type = EnumField(Bibliography.Type)

    authors = AuthorSerializer(many=True, read_only=True)

    software_information = BibliographySoftwareSerializer()
    article_information = BibliographyArticleSerializer()
    conference_information = BibliographyConferenceSerializer()
    poster_information = BibliographyPosterSerializer()

    class Meta:
        model = Bibliography
        fields = "__all__"
