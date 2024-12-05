"""All Django models available"""

from backend.api.models.annotations import (
    AnnotationCampaign,
    AnnotationCampaignArchive,
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
)
from .annotation import (
    Detector,
    DetectorConfiguration,
    AnnotationResult,
    AnnotationResultValidation,
    AnnotationTask,
    AnnotationFileRange,
)
from .spectrogram import (
    LinearScale,
    MultiLinearScale,
    SpectrogramConfiguration,
    WindowType,
)
