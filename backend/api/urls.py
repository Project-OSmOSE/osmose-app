""" APLOSE API Routing"""
from rest_framework import routers
from backend.api.views import (
    DatasetViewSet,
    LabelSetViewSet,
    AnnotationTaskViewSet,
    AnnotationCampaignViewSet,
    AnnotationCommentViewSet,
    ConfidenceIndicatorSetViewSet,
    DetectorViewSet,
)
from backend.aplose_auth.views import UserViewSet

# API urls are meant to be used by our React frontend
api_router = routers.DefaultRouter()
api_router.register(r"dataset", DatasetViewSet, basename="dataset")
api_router.register(r"user", UserViewSet, basename="user")
api_router.register(r"detector", DetectorViewSet, basename="detector")
api_router.register(r"label-set", LabelSetViewSet, basename="label-set")
api_router.register(
    r"annotation-campaign", AnnotationCampaignViewSet, basename="annotation-campaign"
)
api_router.register(
    r"annotation-comment", AnnotationCommentViewSet, basename="annotation-comment"
)
api_router.register(
    r"annotation-task", AnnotationTaskViewSet, basename="annotation-task"
)
api_router.register(
    r"confidence-indicator",
    ConfidenceIndicatorSetViewSet,
    basename="confidence-indicator",
)
