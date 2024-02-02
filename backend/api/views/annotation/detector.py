"""APLOSE - Detector"""
from rest_framework import viewsets
from backend.api.models import Detector
from backend.api.serializers import DetectorSerializer


class DetectorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    `list`, `create`, `retrieve`, `update` and `destroy` detector.
    """

    queryset = Detector.objects.all()
    serializer_class = DetectorSerializer
