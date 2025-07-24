""" project DRF-Viewset file"""
from metadatax.acquisition.views import DeploymentViewSet
from metadatax.common.models import Accessibility
from rest_framework import viewsets, permissions, decorators, response

from backend.osmosewebsite.models import Project
from backend.osmosewebsite.serializers import ProjectSerializer, DeploymentSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for project related actions
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    deployments_queryset = (
        DeploymentViewSet.queryset.filter(
            project__accessibility__in=[Accessibility.REQUEST, Accessibility.OPEN]
        )
        .select_related("project__website_project")
        .prefetch_related(
            "channel_configurations__aplose_datasets__annotation_campaigns__phases__results__label"
        )
    )

    @decorators.action(
        detail=False, name="deployments", url_name="deployments", url_path="deployments"
    )
    def all_deployments(self, request):
        """List all deployments"""
        queryset = self.deployments_queryset
        serializer = DeploymentSerializer(queryset, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=True)
    def deployments(self, request, pk):
        """List all deployments"""
        # pylint: disable=unused-argument
        project: Project = self.get_object()
        queryset = self.deployments_queryset.filter(
            project_id=project.metadatax_project_id,
        )
        serializer = DeploymentSerializer(queryset, many=True)
        return response.Response(serializer.data)
