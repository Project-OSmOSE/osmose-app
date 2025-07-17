"""API GraphQL schemas"""
import graphene
from graphene_django_pagination import DjangoPaginationConnectionField

from .annotation import *
from .common import *
from .data import *


class APIQuery(graphene.ObjectType):  # pylint: disable=too-few-public-methods
    """API GraphQL queries"""

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

    all_acoustic_features = DjangoPaginationConnectionField(AcousticFeaturesNode)
    all_annotations = DjangoPaginationConnectionField(AnnotationNode)
    all_annotation_campaigns = DjangoPaginationConnectionField(AnnotationCampaignNode)
    all_annotation_comments = DjangoPaginationConnectionField(AnnotationCommentNode)
    all_annotation_file_ranges = DjangoPaginationConnectionField(
        AnnotationFileRangeNode
    )
    all_annotation_phases = DjangoPaginationConnectionField(AnnotationPhaseNode)
    all_annotation_tasks = DjangoPaginationConnectionField(AnnotationTaskNode)
    all_annotation_validations = DjangoPaginationConnectionField(
        AnnotationValidationNode
    )
    all_confidences = DjangoPaginationConnectionField(ConfidenceNode)
    all_confidence_sets = DjangoPaginationConnectionField(ConfidenceSetNode)
    all_detectors = DjangoPaginationConnectionField(DetectorNode)
    all_detector_configurations = DjangoPaginationConnectionField(
        DetectorConfigurationNode
    )
    all_labels = DjangoPaginationConnectionField(LabelNode)
    all_label_sets = DjangoPaginationConnectionField(LabelSetNode)
