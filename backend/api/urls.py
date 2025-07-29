""" APLOSE API Routing"""
from rest_framework import routers

from backend.api.view.download import DownloadViewSet

# API urls are meant to be used by our React frontend
api_router = routers.DefaultRouter()
api_router.register("download", DownloadViewSet, basename="download")
