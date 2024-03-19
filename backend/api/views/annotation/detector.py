"""APLOSE - Detector"""
from rest_framework import viewsets

from backend.api.models import Detector
from backend.api.serializers import DetectorSerializer


class DetectorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    `list`, `retrieve` detectors
    """

    queryset = Detector.objects.all()
    serializer_class = DetectorSerializer
