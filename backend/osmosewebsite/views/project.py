""" project DRF-Viewset file"""
from rest_framework import viewsets, permissions, decorators, response
from metadatax.view.acquisition import DeploymentViewSet

from backend.osmosewebsite.models import Project
from backend.osmosewebsite.serializers import ProjectSerializer, DeploymentSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for project related actions
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @decorators.action(
        detail=False, name="deployments", url_name="deployments", url_path="deployments"
    )
    def all_deployments(self, request):
        """List all deployments"""
        queryset = DeploymentViewSet.queryset.select_related("project__website_project")
        serializer = DeploymentSerializer(queryset, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=True)
    def deployments(self, request, pk: int = None):
        """List all deployments"""
        project: Project = self.get_object()
        queryset = DeploymentViewSet.queryset.filter(
            project_id=project.metadatax_project_id
        ).select_related("project__website_project")
        print(queryset.first())
        serializer = DeploymentSerializer(queryset, many=True)
        return response.Response(serializer.data)
