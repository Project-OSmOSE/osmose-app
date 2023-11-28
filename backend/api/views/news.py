""" News DRF-Viewset file"""
from rest_framework import viewsets

from backend.api.models import News
from backend.api.serializers import NewsSerializer


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for news related actions
    """

    authentication_classes = []
    permission_classes = []

    queryset = News.objects.all()
    serializer_class = NewsSerializer
