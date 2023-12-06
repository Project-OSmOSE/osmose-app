"""OSmOSE Website Views - Collaborator"""
from rest_framework import viewsets, permissions
from backend.osmosewebsite.models.collaborator import Collaborator
from backend.osmosewebsite.serializers.collaborator import CollaboratorSerializer


class CollaboratorViewSet(viewsets.ModelViewSet):
    """
    `list`, `create`, `retrieve`, `update` and `destroy` collaborators.
    """

    queryset = Collaborator.objects.all()
    serializer_class = CollaboratorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
