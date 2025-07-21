"""Data related schema"""

import graphene
from graphene import List

from backend.utils.schema import (
    GraphQLPermissions,
    GraphQLResolve,
    AuthenticatedDjangoConnectionField,
)
from .colormap import ColormapNode
from .dataset import (
    DatasetNode,
    ImportDatasetType,
    legacy_resolve_all_datasets_available_for_import,
    resolve_all_datasets_available_for_import,
)
from .fft import FFTNode
from .legacy_spectrogram_configuration import LegacySpectrogramConfigurationNode
from .scales import LinearScaleNode, MultiLinearScaleNode
from .spectrogram import SpectrogramNode
from .spectrogram_analysis import SpectrogramAnalysisNode


class APIDataQuery(graphene.ObjectType):  # pylint: disable=too-few-public-methods
    """API GraphQL queries"""

    all_colormaps = AuthenticatedDjangoConnectionField(ColormapNode)
    all_datasets = AuthenticatedDjangoConnectionField(DatasetNode)
    all_ffts = AuthenticatedDjangoConnectionField(FFTNode)
    all_legacy_spectrogram_configurations = AuthenticatedDjangoConnectionField(
        LegacySpectrogramConfigurationNode
    )
    all_linear_scales = AuthenticatedDjangoConnectionField(LinearScaleNode)
    all_multi_linear_scales = AuthenticatedDjangoConnectionField(MultiLinearScaleNode)
    all_spectrograms = AuthenticatedDjangoConnectionField(SpectrogramNode)
    all_spectrogram_analysis = AuthenticatedDjangoConnectionField(
        SpectrogramAnalysisNode
    )

    all_datasets_available_for_import = List(ImportDatasetType)

    @GraphQLResolve(permission=GraphQLPermissions.STAFF_OR_SUPERUSER)
    def resolve_all_datasets_available_for_import(self, _):
        """Get all datasets for import"""
        datasets = resolve_all_datasets_available_for_import()
        legacy_datasets = legacy_resolve_all_datasets_available_for_import()
        return datasets + legacy_datasets
