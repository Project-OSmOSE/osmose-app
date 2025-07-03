"""OSmOSE Website Views - Bibliography"""
from metadatax.bibliography.models import Bibliography
from rest_framework import viewsets, permissions

from backend.osmosewebsite.serializers import BibliographySerializer


class BibliographyViewSet(viewsets.ReadOnlyModelViewSet):
    """Bibliography view-set"""

    queryset = Bibliography.objects.select_related(
        "software_information",
        "conference_information",
        "article_information",
        "poster_information",
    ).prefetch_related(
        "authors",
        "tags",
    )
    serializer_class = BibliographySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
