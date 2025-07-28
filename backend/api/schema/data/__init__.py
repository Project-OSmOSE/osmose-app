"""Data related schema"""

import graphene
from graphene_django.debug import DjangoDebug

from backend.utils.schema import (
    AuthenticatedDjangoConnectionField,
)
from .colormap import ColormapNode
from .dataset import (
    DatasetNode,
    ImportDatasetType,
    legacy_resolve_all_datasets_available_for_import,
    resolve_all_datasets_available_for_import,
    DatasetQuery,
)
from .fft import FFTNode
from .legacy_spectrogram_configuration import LegacySpectrogramConfigurationNode
from .scales import LinearScaleNode, MultiLinearScaleNode
from .spectrogram import SpectrogramNode
from .spectrogram_analysis import SpectrogramAnalysisNode, SpectrogramAnalysisQuery


class APIDataQuery(
    DatasetQuery,
    SpectrogramAnalysisQuery,
    graphene.ObjectType,
):  # pylint: disable=too-few-public-methods
    """API GraphQL queries"""

    debug = graphene.Field(DjangoDebug, name="_debug")

    all_colormaps = AuthenticatedDjangoConnectionField(ColormapNode)

    all_ffts = AuthenticatedDjangoConnectionField(FFTNode)
    all_legacy_spectrogram_configurations = AuthenticatedDjangoConnectionField(
        LegacySpectrogramConfigurationNode
    )
    all_linear_scales = AuthenticatedDjangoConnectionField(LinearScaleNode)
    all_multi_linear_scales = AuthenticatedDjangoConnectionField(MultiLinearScaleNode)
    all_spectrograms = AuthenticatedDjangoConnectionField(SpectrogramNode)

