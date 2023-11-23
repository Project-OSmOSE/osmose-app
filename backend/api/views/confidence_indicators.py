"""Confidence Indicator Set DRF-Viewset file"""

from rest_framework import viewsets
from rest_framework.response import Response
from backend.api.models import ConfidenceIndicatorSet
from backend.api.serializers import ConfidenceIndicatorSetSerializer


class ConfidenceIndicatorSetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for confidence indicator set
    """

    queryset = ConfidenceIndicatorSet.objects.all()
    serializer_class = ConfidenceIndicatorSetSerializer

    def list(self, request):
        """List available confidence indicator sets"""
        queryset = self.queryset
        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)
