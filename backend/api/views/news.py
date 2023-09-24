""" News DRF-Viewset file"""

from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema

from backend.api.models import News
from backend.api.serializers import NewsSerializer, NewsRetrieveSerializer

class NewsViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for news related actions
    """

    queryset = News.objects.all()
    serializer_class = NewsSerializer

    def list(self, request):
        """List news"""
        serializer = self.serializer_class(self.queryset, many=True)
        return Response(serializer.data)

    @extend_schema(responses=NewsRetrieveSerializer)
    def retrieve(self, request, pk=None):
        """Show a specific news"""
        one_news = get_object_or_404(self.queryset, pk=pk)
        serializer = NewsRetrieveSerializer(one_news)
        return Response(serializer.data)
