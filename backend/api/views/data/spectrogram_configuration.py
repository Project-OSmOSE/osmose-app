"""Spectrogram configuration viewset"""
from django.db.models import QuerySet
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import (
    SpectrogramConfiguration,
)
from backend.api.serializers import (
    SpectrogramConfigurationSerializer,
)
from backend.utils.filters import ModelFilter
from backend.utils.renderers import CSVRenderer


class SpectrogramConfigurationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for SpectrogramConfiguration related actions
    """

    queryset = SpectrogramConfiguration.objects.all()
    serializer_class = SpectrogramConfigurationSerializer
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
        queryset: QuerySet[SpectrogramConfiguration] = self.get_queryset()
        filename = (
            request.query_params["filename"]
            if "filename" in request.query_params
            else "spectrogram_configurations"
        )
        header = [
            "dataset_name",
            "dataset_sr",
            "nfft",
            "window_size",
            "overlap",
            "colormap",
            "zoom_level",
            "dynamic_min",
            "dynamic_max",
            "spectro_duration",
            "data_normalization",
            "hp_filter_min_freq",
            "sensitivity_dB",  # seulement pour normalisation instrument / vide pour zscore
            "peak_voltage",  # seulement pour normalisation instrument / vide pour zscore
            "gain_dB",  # seulement pour normalisation instrument / vide pour zscore
            "spectro_normalization",
            "zscore_duration",  # seulement pour normalisation zscore / vide pour instrument
            "window_type",
            "frequency_resolution",
            "temporal_resolution",
            "audio_file_dataset_overlap",
        ]
        data = [header]

        for config in queryset:
            config_data = []
            for label in header:
                if label == "dataset_name":
                    config_data.append(config.dataset.name)
                elif label == "dataset_sr":
                    config_data.append(str(config.dataset.audio_metadatum.dataset_sr))
                else:
                    value = getattr(config, label)
                    if value is None:
                        value = ""
                    else:
                        value = str(value)
                    config_data.append(value)
            data.append(config_data)

        response = Response(data)
        response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'
        return response
