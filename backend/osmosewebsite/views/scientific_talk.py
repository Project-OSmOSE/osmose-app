""" ScientificTalk DRF-Viewset file"""
from rest_framework import viewsets, permissions

from backend.osmosewebsite.models import ScientificTalk

from backend.osmosewebsite.serializers import ScientificTalkSerializer


class ScientificTalkViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for ScientificTalk related actions
    """

    queryset = ScientificTalk.objects.all()
    serializer_class = ScientificTalkSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
