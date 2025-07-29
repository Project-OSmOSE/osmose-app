"""View for file downloads"""
import io
import zipfile

from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.viewsets import ViewSet

from backend.api.models import SpectrogramAnalysis


class DownloadViewSet(ViewSet):
    """Download view set"""

    @action(
        detail=False,
        url_path="analysis-export/(?P<pk>[^/.]+)",
        url_name="analysis-export",
    )
    def download_analysis_export(self, request, pk=None):
        """
        Download analysis export
        For legacy analysis: audio metadata and spectro config csv
        For current analysis: TODO: translate in new osekit
        """
        analysis: SpectrogramAnalysis = get_object_or_404(
            SpectrogramAnalysis.objects.all(), pk=pk
        )

        # Create a buffer to write the zipfile into
        zip_buffer = io.BytesIO()

        # Create the zipfile, giving the buffer as the target
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            zip_file.writestr(
                "audio_metadatum.csv",
                data=analysis.legacy_audio_metadatum_csv().encode("utf-8"),
            )
            zip_file.writestr(
                "spectrogram_configuration.csv",
                data=analysis.legacy_spectrogram_configuration_csv().encode("utf-8"),
            )

        response = HttpResponse(content_type="application/x-zip-compressed")
        response["Content-Disposition"] = f"attachment; filename={analysis.name}.zip"
        # Write the value of our buffer to the response
        response.write(zip_buffer.getvalue())
        return response
