"""DatasetFile viewset"""
from rest_framework import viewsets, permissions

from backend.api.models import DatasetFile
from backend.api.serializers import DatasetFileSerializer
from backend.utils.filters import ModelFilter


class DatasetFileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for DatasetFile related actions
    """

    queryset = DatasetFile.objects.all().select_related(
        "dataset", "dataset__audio_metadatum"
    )
    serializer_class = DatasetFileSerializer
    filter_backends = (ModelFilter,)
    permission_classes = (permissions.IsAuthenticated,)
