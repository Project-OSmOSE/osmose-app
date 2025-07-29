"""SpectrogramAnalysis schema"""
from os import listdir
from os.path import join, isfile, exists

from django.conf import settings
from django.db.models import Count, Min, Max
from django_filters import OrderingFilter, FilterSet, NumberFilter
from graphene import relay, ObjectType, NonNull, String, Int, DateTime
from osekit.public_api.dataset import (
    Dataset as OSEkitDataset,
    SpectroDataset as OSEkitSpectroDataset,
)
from typing_extensions import deprecated

from backend.api.models import SpectrogramAnalysis
from backend.utils.schema import AuthenticatedDjangoConnectionField, ApiObjectType
from .spectrogram import SpectrogramNode


class SpectrogramAnalysisFilter(FilterSet):
    """SpectrogramAnalysis filters"""

    dataset_id = NumberFilter()
    annotation_campaigns__id = NumberFilter()

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = SpectrogramAnalysis
        fields = {
            "dataset_id": ["exact", "in"],
            "annotation_campaigns__id": ["exact", "in"],
        }

    order_by = OrderingFilter(fields=("created_at",))


class SpectrogramAnalysisNode(ApiObjectType):
    """SpectrogramAnalysis schema"""

    spectrograms = AuthenticatedDjangoConnectionField(SpectrogramNode)
    files_count = Int()

    start = DateTime()
    end = DateTime()

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = SpectrogramAnalysis
        fields = "__all__"
        filterset_class = SpectrogramAnalysisFilter
        interfaces = (relay.Node,)

    @classmethod
    def get_queryset(cls, queryset, info):
        field_names = cls._get_query_field_names(info)

        cls._init_queryset_extensions()
        if "filesCount" in field_names:
            cls.annotations = {
                **cls.annotations,
                "files_count": Count("spectrograms", distinct=True),
            }
            cls.prefetch.append("spectrograms")
        if "start" in field_names:
            cls.annotations = {
                **cls.annotations,
                "start": Min("spectrograms__start"),
            }
            cls.prefetch.append("spectrograms")
        if "end" in field_names:
            cls.annotations = {
                **cls.annotations,
                "end": Max("spectrograms__end"),
            }
            cls.prefetch.append("spectrograms")
        return cls._finalize_queryset(super().get_queryset(queryset, info))


class ImportSpectrogramAnalysisType(
    ObjectType
):  # pylint: disable=too-few-public-methods
    """Type for import dataset"""

    name = NonNull(String)
    path = NonNull(String)


def resolve_all_spectrogram_analysis_available_for_import(
    dataset: OSEkitDataset,
    folder: str,
) -> [ImportSpectrogramAnalysisType]:
    """List spectrogram analysis available for import"""
    known_spectrogram_analysis = SpectrogramAnalysis.objects.filter(
        dataset__name=folder,
        dataset__path=folder,
    ).values_list("name", flat=True)

    available_analyses: [ImportSpectrogramAnalysisType] = []
    for [name, d] in dataset.datasets.items():
        if d["class"] != OSEkitSpectroDataset.__name__:
            continue
        if name in known_spectrogram_analysis:
            continue
        analysis = ImportSpectrogramAnalysisType()
        analysis.name = name
        analysis.path = str(d["dataset"].folder).split(folder)[1].strip("\\").strip("/")
        available_analyses.append(analysis)
    return available_analyses


@deprecated(
    "Use resolve_all_spectrogram_analysis_available_for_import with the recent version of OSEkit"
)
def legacy_resolve_all_spectrogram_analysis_available_for_import(
    dataset_name: str,
    dataset_path: str,
    config_folder: str,
) -> [ImportSpectrogramAnalysisType]:
    """[Legacy] List spectrogram analysis available for import"""
    known_analysis_names = SpectrogramAnalysis.objects.filter(
        dataset__name=dataset_name,
        dataset__path=dataset_path,
    ).values_list("name", flat=True)

    available_analyses: [ImportSpectrogramAnalysisType] = []
    spectro_root = join(
        settings.DATASET_IMPORT_FOLDER,
        dataset_path,
        "processed",
        "spectrogram",
        config_folder,
    )

    spectro_folders = [
        f for f in listdir(spectro_root) if not isfile(join(spectro_root, f))
    ]
    for folder in spectro_folders:
        csv_path = join(spectro_root, folder, "metadata.csv")
        if not exists(csv_path):
            continue
        if folder in known_analysis_names:
            continue
        analysis = ImportSpectrogramAnalysisType()
        analysis.name = folder
        analysis.path = join(
            "processed",
            "spectrogram",
            config_folder,
            folder,
        )
        available_analyses.append(analysis)
    return available_analyses


class SpectrogramAnalysisQuery(ObjectType):  # pylint: disable=too-few-public-methods
    """SpectrogramAnalysis queries"""

    all_spectrogram_analysis = AuthenticatedDjangoConnectionField(
        SpectrogramAnalysisNode
    )
