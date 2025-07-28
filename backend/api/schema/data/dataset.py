"""Dataset schema"""
import csv
from os import listdir
from os.path import isfile, join, exists
from pathlib import Path

from django.conf import settings
from django.db.models import Count, Min, QuerySet, Max
from django_filters import FilterSet, OrderingFilter
from graphene import (
    relay,
    List,
    NonNull,
    String,
    Boolean,
    ObjectType,
    Int,
    ID,
    Field,
    DateTime,
)
from graphql import GraphQLResolveInfo
from osekit.public_api.dataset import (
    Dataset as OSEkitDataset,
)
from typing_extensions import deprecated, Optional

from backend.api.models import Dataset
from backend.utils.schema import (
    AuthenticatedDjangoConnectionField,
    ApiObjectType,
    GraphQLResolve,
    GraphQLPermissions,
)
from .spectrogram_analysis import (
    ImportSpectrogramAnalysisType,
    legacy_resolve_all_spectrogram_analysis_available_for_import,
    resolve_all_spectrogram_analysis_available_for_import,
)
from .spectrogram_analysis import SpectrogramAnalysisNode


class DatasetFilter(FilterSet):
    """Dataset filters"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Dataset
        fields = {}

    order_by = OrderingFilter(fields=("created_at",))


class DatasetNode(ApiObjectType):
    """Dataset schema"""

    spectrogram_analysis = AuthenticatedDjangoConnectionField(SpectrogramAnalysisNode)
    analysis_count = Int()
    files_count = Int()

    start = DateTime()
    end = DateTime()

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Dataset
        fields = "__all__"
        filterset_class = DatasetFilter
        interfaces = (relay.Node,)

    @classmethod
    def get_queryset(cls, queryset: QuerySet[Dataset], info: GraphQLResolveInfo):
        field_names = cls._get_query_field_names(info)

        annotations = {}
        prefetch = []
        if "analysisCount" in field_names:
            annotations = {
                **annotations,
                "analysis_count": Count("spectrogram_analysis", distinct=True),
            }
            prefetch.append("spectrogram_analysis")
        if "filesCount" in field_names:
            annotations = {
                **annotations,
                "files_count": Count(
                    "spectrogram_analysis__spectrograms", distinct=True
                ),
            }
            prefetch.append("spectrogram_analysis__spectrograms")
        if "start" in field_names:
            annotations = {
                **annotations,
                "start": Min("spectrogram_analysis__spectrograms__start"),
            }
            prefetch.append("spectrogram_analysis__spectrograms")
        if "end" in field_names:
            annotations = {
                **annotations,
                "end": Max("spectrogram_analysis__spectrograms__end"),
            }
            prefetch.append("spectrogram_analysis__spectrograms")
        return (
            super()
            .get_queryset(queryset, info)
            .prefetch_related(*prefetch)
            .annotate(**annotations)
        )


class ImportDatasetType(ObjectType):  # pylint: disable=too-few-public-methods
    """Type for import dataset"""

    name = NonNull(String)
    path = NonNull(String)
    legacy = Boolean()
    analysis = List(ImportSpectrogramAnalysisType)


def resolve_all_datasets_available_for_import() -> [ImportDatasetType]:
    """List dataset available for import"""
    folders = [
        f
        for f in listdir(settings.DATASET_IMPORT_FOLDER)
        if not isfile(join(settings.DATASET_IMPORT_FOLDER, f))
    ]
    available_datasets: [ImportDatasetType] = []
    for folder in folders:
        json_path = join(settings.DATASET_IMPORT_FOLDER, folder, "dataset.json")
        if not exists(json_path):
            continue
        dataset = OSEkitDataset.from_json(Path(json_path))
        d = ImportDatasetType()
        d.name = folder
        d.path = folder
        d.analysis = resolve_all_spectrogram_analysis_available_for_import(
            dataset,
            folder=folder,
        )
        if len(d.analysis) > 0:
            available_datasets.append(d)
    return available_datasets


@deprecated(
    "Use resolve_all_datasets_available_for_import with the recent version of OSEkit"
)
def legacy_resolve_all_datasets_available_for_import() -> [ImportDatasetType]:
    """Get all datasets for import - using legacy OSEkit"""
    datasets_csv_path = settings.DATASET_IMPORT_FOLDER / settings.DATASET_FILE
    available_datasets: [ImportDatasetType] = []
    if not exists(datasets_csv_path):
        return []
    with open(datasets_csv_path, encoding="utf-8") as csvfile:
        dataset: dict
        for dataset in csv.DictReader(csvfile):

            # Get dataset
            available_dataset: Optional[ImportDatasetType] = None
            for d in available_datasets:
                if d.path == dataset["path"]:
                    available_dataset = d
            if not available_dataset:
                # noinspection PyTypeChecker
                available_dataset = ImportDatasetType()
                available_dataset.name = dataset["dataset"]
                available_dataset.path = dataset["path"]
                available_dataset.analysis = []
                available_dataset.legacy = True

            # Get its analysis
            analysis = legacy_resolve_all_spectrogram_analysis_available_for_import(
                dataset_name=available_dataset.name,
                dataset_path=available_dataset.path,
                config_folder=(
                    f"{dataset['spectro_duration']}_{dataset['dataset_sr']}"
                ),
            )
            for a in analysis:
                available_dataset.analysis.append(a)
            if len(available_dataset.analysis) > 0:
                available_datasets.append(available_dataset)
    return available_datasets


class DatasetQuery(ObjectType):
    """Dataset queries"""

    all_datasets = AuthenticatedDjangoConnectionField(DatasetNode)

    dataset_by_id = Field(DatasetNode, id=ID(required=True))

    @GraphQLResolve(permission=GraphQLPermissions.AUTHENTICATED)
    def resolve_dataset_by_id(self, info, id: int):
        """Get dataset by id"""
        return DatasetNode.get_node(info, id)

    all_datasets_available_for_import = List(ImportDatasetType)

    @GraphQLResolve(permission=GraphQLPermissions.STAFF_OR_SUPERUSER)
    def resolve_all_datasets_available_for_import(self, _):
        """Get all datasets for import"""
        datasets = resolve_all_datasets_available_for_import()
        legacy_datasets = legacy_resolve_all_datasets_available_for_import()
        return datasets + legacy_datasets
