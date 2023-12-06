""" project DRF-Viewset file"""
from rest_framework import viewsets, permissions

from backend.osmosewebsite.models import Project
from backend.osmosewebsite.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for project related actions
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
