"""
DRF serializers module to be used in viewsets
"""

from backend.api.serializers.annotation_campaign import (
    AnnotationCampaignRetrieveAuxCampaignSerializer,
    AnnotationCampaignRetrieveAuxTaskSerializer,
    AnnotationCampaignRetrieveSerializer,
)
from backend.api.serializers.annotation_comment import (
    AnnotationCommentSerializer,
    AnnotationCommentCreateSerializer,
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
from backend.api.serializers.confidence_indicator_set import (
    ConfidenceIndicatorSerializer,
    ConfidenceIndicatorSetSerializer,
)
from backend.api.serializers.dataset import (
    DatasetSerializer,
)
from backend.api.serializers.label_set import LabelSetSerializer
from backend.api.serializers.user import UserSerializer, UserCreateSerializer
from .annotation import (
    DetectorSerializer,
    DetectorConfigurationSerializer,
    AnnotationCampaignCreateCreateAnnotationsSerializer,
    AnnotationCampaignCreateCheckAnnotationsSerializer,
    AnnotationCampaignAddAnnotatorsSerializer,
    AnnotationCampaignListSerializer,
)
from .spectrogram import (
    SpectrogramConfigurationSerializer,
)
