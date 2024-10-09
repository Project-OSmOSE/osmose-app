"""
DRF serializers module to be used in viewsets
"""
from .detector import (
    DetectorSerializer,
    DetectorConfigurationSerializer,
)
from .campaign import *
from .file_range import (
    AnnotationFileRangeSerializer,
    AnnotationFileRangeFilesSerializer,
)
