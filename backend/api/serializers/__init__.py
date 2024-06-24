"""
DRF serializers module to be used in viewsets
"""

from backend.api.serializers.dataset import DatasetSerializer, SpectroConfigSerializer
from backend.api.serializers.user import UserSerializer, UserCreateSerializer
from backend.api.serializers.annotation_set import AnnotationSetSerializer
from backend.api.serializers.confidence_indicator_set import (
    ConfidenceIndicatorSerializer,
    ConfidenceIndicatorSetSerializer,
)
from backend.api.serializers.annotation_comment import (
    AnnotationCommentSerializer,
    AnnotationCommentCreateSerializer,
)
from backend.api.serializers.annotation_campaign import (
    AnnotationCampaignListSerializer,
    AnnotationCampaignRetrieveAuxCampaignSerializer,
    AnnotationCampaignRetrieveAuxTaskSerializer,
    AnnotationCampaignRetrieveSerializer,
)
from backend.api.serializers.annotation_task import (
    AnnotationTaskSerializer,
    AnnotationTaskBoundarySerializer,
    AnnotationTaskResultSerializer,
    AnnotationTaskSpectroSerializer,
    AnnotationTaskRetrieveSerializer,
    AnnotationTaskUpdateSerializer,
    AnnotationTaskOneResultUpdateSerializer,
    AnnotationTaskUpdateOutputCampaignSerializer,
)
from .annotation import (
    DetectorSerializer,
    DetectorConfigurationSerializer,
    AnnotationCampaignCreateCreateAnnotationsSerializer,
    AnnotationCampaignCreateCheckAnnotationsSerializer,
    AnnotationCampaignAddAnnotatorsSerializer,
)
