"""All Django models available"""

from django.contrib.auth import get_user_model

from backend.api.models.datasets import DatasetType, Dataset, DatasetFile
from backend.api.models.metadata import (
    AudioMetadatum,
    GeoMetadatum,
    SpectroConfig,
    WindowType,
)
from backend.api.models.annotations import (
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
    AnnotationTag,
    AnnotationSet,
    AnnotationCampaign,
    AnnotationComment,
    AnnotationSession,
    AnnotationTask,
    AnnotationCampaignUsage,
)
from backend.api.models.annotation import (
    Detector,
    DetectorConfiguration,
    AnnotationResult,
    AnnotationResultValidation,
)

from .user import User
