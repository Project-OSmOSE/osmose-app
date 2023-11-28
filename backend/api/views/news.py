""" News DRF-Viewset file"""
# pylint: disable=C0301,line-too-long
from datetime import datetime
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response

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
