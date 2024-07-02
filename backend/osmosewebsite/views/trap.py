""" Trap DRF-Viewset file"""
from rest_framework import viewsets, permissions

from backend.osmosewebsite.models import Trap

from backend.osmosewebsite.serializers import TrapSerializer


class TrapViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for Trap related actions
    """

    queryset = Trap.objects.all()
    serializer_class = TrapSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
