""" APLOSE API Routing"""
from rest_framework import routers

from backend.aplose.views import UserViewSet, AnnotatorViewSet

# API urls are meant to be used by our React frontend
aplose_router = routers.DefaultRouter()
aplose_router.register(r"user", UserViewSet, basename="user")
aplose_router.register(r"annotator", AnnotatorViewSet, basename="annotator")
