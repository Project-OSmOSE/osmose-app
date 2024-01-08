""" News DRF-Viewset file"""
from rest_framework import viewsets, permissions

from backend.osmosewebsite.models import News
from backend.osmosewebsite.serializers import NewsSerializer


class NewsViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for news related actions
    """

    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
