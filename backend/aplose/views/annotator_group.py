"""AnnotatorGroup DRF-Viewset file"""

from rest_framework import viewsets, permissions

from backend.aplose.models import AnnotatorGroup
from backend.aplose.serializers import AnnotatorGroupSerializer


class AnnotatorGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for annotator-group-related actions
    """

    queryset = AnnotatorGroup.objects.prefetch_related("annotators")
    serializer_class = AnnotatorGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
