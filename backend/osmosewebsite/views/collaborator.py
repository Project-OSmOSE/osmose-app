"""OSmOSE Website Views - Collaborator"""
from rest_framework import viewsets, permissions, decorators, response
from backend.osmosewebsite.models import Collaborator
from backend.osmosewebsite.serializers import CollaboratorSerializer


class CollaboratorViewSet(viewsets.ModelViewSet):
    """
    `list`, `create`, `retrieve`, `update` and `destroy` collaborators.
    """

    queryset = Collaborator.objects.all()
    serializer_class = CollaboratorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @decorators.action(detail=False)
    def on_home(self, request):
        """List collaborators to be shown on home page"""
        queryset = Collaborator.objects.all().filter(show_on_home_page=True)
        serializer = self.serializer_class(queryset, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=False)
    def on_aplose_home(self, request):
        """List collaborators to be shown on Aplose home page"""
        queryset = Collaborator.objects.all().filter(show_on_aplose_home=True)
        serializer = self.serializer_class(queryset, many=True)
        return response.Response(serializer.data)
