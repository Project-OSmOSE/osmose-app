"""
DRF views module based on viewsets
"""

from backend.api.views.label_set import LabelSetViewSet
from backend.api.views.confidence_indicators import ConfidenceIndicatorSetViewSet
from backend.api.views.dataset import DatasetViewSet
from .annotation import *
from .data import *
