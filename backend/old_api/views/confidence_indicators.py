"""Confidence Indicator Set DRF-Viewset file"""

from rest_framework import viewsets, permissions

from backend.api.models import ConfidenceIndicatorSet
from backend.api.serializers import ConfidenceIndicatorSetSerializer
from backend.utils.filters import ModelFilter


class ConfidenceIndicatorSetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for confidence indicator set
    """

    queryset = ConfidenceIndicatorSet.objects.all().prefetch_related(
        "indicator_relations",
        "indicator_relations__confidence_indicator",
    )
    serializer_class = ConfidenceIndicatorSetSerializer
    filter_backends = (ModelFilter,)
    permission_classes = (permissions.IsAuthenticated,)
