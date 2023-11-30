""" News DRF-Viewset file"""
from rest_framework import viewsets

from backend.osmosewebsite.models import News
from backend.osmosewebsite.serializers import NewsSerializer


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for news related actions
    """

    queryset = News.objects.all()
    serializer_class = NewsSerializer
