"""OSmOSE Website Views - Bibliography"""
from rest_framework import viewsets, permissions

from backend.osmosewebsite.models import Bibliography
from backend.osmosewebsite.serializers import BibliographySerializer


class BibliographyViewSet(viewsets.ReadOnlyModelViewSet):
    """Bibliography view-set"""

    queryset = Bibliography.objects.all()
    serializer_class = BibliographySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
