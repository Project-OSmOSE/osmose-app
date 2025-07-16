"""API GraphQL schemas"""
import graphene
from graphene_django_pagination import DjangoPaginationConnectionField

from .common import *
from .data import *


class APIQuery(graphene.ObjectType):

    all_archives = DjangoPaginationConnectionField(ArchiveNode)

    all_colormaps = DjangoPaginationConnectionField(ColormapNode)
    all_ffts = DjangoPaginationConnectionField(FFTNode)
    all_datasets = DjangoPaginationConnectionField(DatasetNode)
    all_legacy_spectrogram_configurations = DjangoPaginationConnectionField(
        LegacySpectrogramConfigurationNode
    )
    all_linear_scales = DjangoPaginationConnectionField(LinearScaleNode)
    all_multi_linear_scales = DjangoPaginationConnectionField(MultiLinearScaleNode)
    all_spectrograms = DjangoPaginationConnectionField(SpectrogramNode)
    all_spectrogram_analysis = DjangoPaginationConnectionField(SpectrogramAnalysisNode)
