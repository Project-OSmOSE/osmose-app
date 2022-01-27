"""Annotation set DRF-Viewset file"""

from rest_framework import viewsets
from rest_framework.response import Response

from backend.api.models import AnnotationSet
from backend.api.serializers import AnnotationSetSerializer


class AnnotationSetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for user-related actions
    """

    serializer_class = AnnotationSetSerializer

    def list(self, request):
        """List users"""
        queryset = AnnotationSet.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
