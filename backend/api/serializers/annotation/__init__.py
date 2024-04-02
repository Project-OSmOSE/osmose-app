"""
DRF serializers module to be used in viewsets
"""
from .detector import (
    DetectorSerializer,
    DetectorConfigurationSerializer,
)
from .campaign import (
    AnnotationCampaignCreateCheckAnnotationsSerializer,
    AnnotationCampaignCreateCreateAnnotationsSerializer,
    AnnotationCampaignAddAnnotatorsSerializer,
)
