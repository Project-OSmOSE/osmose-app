"""Annotation related schema"""
import graphene

from backend.utils.schema import AuthenticatedDjangoConnectionField
from .acoustic_features import AcousticFeaturesNode
from .annotation import AnnotationNode
from .annotation_campaign import AnnotationCampaignNode
from .annotation_comment import AnnotationCommentNode
from .annotation_file_range import AnnotationFileRangeNode
from .annotation_phase import AnnotationPhaseNode
from .annotation_task import AnnotationTaskNode
from .annotation_validation import AnnotationValidationNode
from .confidence import ConfidenceNode
from .confidence_set import ConfidenceSetNode
from .detector import DetectorNode
from .detector_configuration import DetectorConfigurationNode
from .label import LabelNode
from .label_set import LabelSetNode


class APIAnnotationQuery(graphene.ObjectType):  # pylint: disable=too-few-public-methods
    """API GraphQL queries"""

    all_acoustic_features = AuthenticatedDjangoConnectionField(AcousticFeaturesNode)
    all_annotations = AuthenticatedDjangoConnectionField(AnnotationNode)
    all_annotation_campaigns = AuthenticatedDjangoConnectionField(
        AnnotationCampaignNode
    )
    all_annotation_comments = AuthenticatedDjangoConnectionField(AnnotationCommentNode)
    all_annotation_file_ranges = AuthenticatedDjangoConnectionField(
        AnnotationFileRangeNode
    )
    all_annotation_phases = AuthenticatedDjangoConnectionField(AnnotationPhaseNode)
    all_annotation_tasks = AuthenticatedDjangoConnectionField(AnnotationTaskNode)
    all_annotation_validations = AuthenticatedDjangoConnectionField(
        AnnotationValidationNode
    )
    all_confidences = AuthenticatedDjangoConnectionField(ConfidenceNode)
    all_confidence_sets = AuthenticatedDjangoConnectionField(ConfidenceSetNode)
    all_detectors = AuthenticatedDjangoConnectionField(DetectorNode)
    all_detector_configurations = AuthenticatedDjangoConnectionField(
        DetectorConfigurationNode
    )
    all_annotation_labels = AuthenticatedDjangoConnectionField(LabelNode)
    all_label_sets = AuthenticatedDjangoConnectionField(LabelSetNode)
