"""AudioMetadatum viewset"""
from django.db.models import QuerySet
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import (
    AudioMetadatum,
)
from backend.api.serializers import AudioMetadatumSerializer
from backend.utils.filters import ModelFilter
from backend.utils.renderers import CSVRenderer


class AudioMetadatumViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for AudioMetadatum related actions
    """

    queryset = AudioMetadatum.objects.all()
    serializer_class = AudioMetadatumSerializer
    filter_backends = (ModelFilter,)
    permission_classes = (permissions.IsAuthenticated,)

    @action(
        detail=False,
        url_path="export",
        url_name="export",
        renderer_classes=[CSVRenderer],
    )
    def export(self, request):
        """Export queryset as CSV"""
        queryset: QuerySet[AudioMetadatum] = self.filter_queryset(self.get_queryset())
        filename = (
            request.query_params["filename"]
            if "filename" in request.query_params
            else "audio_metadata"
        )
        header = [
            "dataset",
            "sample_bits",
            "channel_count",
            "audio_file_count",
            "start_date",
            "end_date",
            # "dataset_origin_volume",
            # "dataset_origin_duration",
            # "is_built",
            # "audio_file_dataset_overlap",
            # "lat",
            # "lon",
            # "depth",
            "dataset_sr",
            "audio_file_dataset_duration",
        ]
        data = [header]

        for metadatum in queryset:
            metadatum_data = []
            for label in header:
                if label == "dataset":
                    metadatum_data.append(
                        ", ".join(
                            list(metadatum.dataset_set.values_list("name", flat=True))
                        )
                    )
                elif label == "start_date":
                    metadatum_data.append(str(metadatum.start))
                elif label == "end_date":
                    metadatum_data.append(str(metadatum.end))
                else:
                    metadatum_data.append(str(getattr(metadatum, label)))
            data.append(metadatum_data)

        response = Response(data)
        response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'
        return response
