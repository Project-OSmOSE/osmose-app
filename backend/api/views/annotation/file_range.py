"""Viewset for annotation file range"""
from rest_framework import viewsets

from backend.api.models import AnnotationFileRange
from backend.api.serializers import (
    AnnotationFileRangeSerializer,
    AnnotationFileRangeFinishedSerializer,
)
from backend.utils.filters import ModelFilter


class AnnotationFileRangeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for annotation file range related actions
    """

    queryset = AnnotationFileRange.objects.select_related(
        "annotator",
        "annotator__aplose",
        "annotation_campaign",
    ).prefetch_related(
        "annotation_campaign__datasets",
    )
    serializer_class = AnnotationFileRangeSerializer
    filter_backends = (ModelFilter,)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"] and self.request.query_params.get(
            "with_finish_count"
        ):
            return AnnotationFileRangeFinishedSerializer
        return super().get_serializer_class()
