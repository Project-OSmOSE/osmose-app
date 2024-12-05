"""
DRF serializers module to be used in viewsets
"""
from .detector import (
    DetectorSerializer,
    DetectorConfigurationSerializer,
)
from .campaign import AnnotationCampaignBasicSerializer
from .file_range import (
    AnnotationFileRangeSerializer,
    AnnotationFileRangeFilesSerializer,
)
from .result import AnnotationResultSerializer, AnnotationResultImportListSerializer
from .comment import AnnotationCommentSerializer
from .session import AnnotationSessionSerializer
