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
            if analysis.legacy:
                zip_file.writestr(
                    "audio_metadatum.csv",
                    data=analysis.legacy_audio_metadatum_csv().encode("utf-8"),
                )
                zip_file.writestr(
                    "spectrogram_configuration.csv",
                    data=analysis.legacy_spectrogram_configuration_csv().encode(
                        "utf-8"
                    ),
                )
            else:
                zip_file.writestr(
                    "create_analyse.py",
                    data=f"""
                    import numpy as np
                    from osekit.public_api.analysis import Analysis, AnalysisType
                    from pandas import Timestamp, Timedelta
                    from scipy.signal import ShortTimeFFT
                    
                    fft = ShortTimeFFT(
                        mfft={analysis.fft.nfft},
                        win=np.array({list([int(item) for item in analysis.fft.window])}),
                        hop={round(analysis.fft.window_size * (1 - analysis.fft.overlap))},
                        fs={analysis.fft.sampling_frequency},
                        scale_to={analysis.fft.scaling if analysis.fft.scaling in ["magnitude", "psd"] else None},
                    )
                    
                    Analysis(
                        analysis_type=AnalysisType.SPECTROGRAM,  # Spectro only
                        begin=Timestamp.fromisoformat({analysis.start_date.isoformat()}),
                        end=Timestamp.fromisoformat({analysis.end_date.isoformat()}),
                        data_duration=Timedelta(f"{analysis.data_duration}s"),
                        sample_rate={analysis.fft.sampling_frequency},
                        name="{analysis.name}",
                        fft=fft,
                        colormap={analysis.colormap.name},
                    )
                    """.encode(
                        "utf-8"
                    ),
                )

        response = HttpResponse(content_type="application/x-zip-compressed")
        response["Content-Disposition"] = f"attachment; filename={analysis.name}.zip"
        # Write the value of our buffer to the response
        response.write(zip_buffer.getvalue())
        return response
