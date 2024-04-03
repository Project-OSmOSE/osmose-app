"""Label set DRF-Viewset file"""

from django.db.models.functions import Lower

from rest_framework import viewsets
from rest_framework.response import Response

from backend.api.models import LabelSet
from backend.api.serializers import LabelSetSerializer


class LabelSetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for user-related actions
    """

    serializer_class = LabelSetSerializer

    def list(self, request):
        """List users"""
        queryset = LabelSet.objects.all().order_by(Lower("name"))
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
