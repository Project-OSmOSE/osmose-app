"""All Django models available"""

from backend.api.models.annotation import (
    Detector,
    DetectorConfiguration,
    AnnotationResult,
    AnnotationResultValidation,
)

from backend.api.models.annotations import (
    AnnotationCampaign,
    AnnotationCampaignUsage,
    AnnotationComment,
    AnnotationSession,
    AnnotationTask,
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
    Label,
    LabelSet,
)

from backend.api.models.datasets import (
    DatasetType,
    Dataset,
    DatasetFile,
)

from backend.api.models.metadata import (
    AudioMetadatum,
    GeoMetadatum,
    SpectroConfig,
    WindowType,
)

from .user import User
