"""Label set DRF-Viewset file"""

from django.db.models.functions import Lower

from rest_framework import viewsets, permissions

from backend.api.models import LabelSet
from backend.api.serializers import LabelSetSerializer
from backend.utils.filters import ModelFilter


class LabelSetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for user-related actions
    """

    queryset = LabelSet.objects.all().order_by(Lower("name"))
    serializer_class = LabelSetSerializer
    filter_backends = (ModelFilter,)
    permission_classes = (permissions.IsAuthenticated,)
