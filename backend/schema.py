"""GraphQL Schema"""

import graphene
from django_filters import NumberFilter
from graphene import relay, Field
from graphene_django_pagination import DjangoPaginationConnectionField
from metadatax.acquisition.models import Deployment, Project
from metadatax.acquisition.schema.deployment import (
    DeploymentNode as MetadataxDeploymentNode,
    DeploymentFilter as MetadataxDeploymentFilter,
)
from metadatax.acquisition.schema.project import ProjectFilter
from metadatax.acquisition.schema.project import ProjectNode as MetadataxProjectNode
from metadatax.schema import Mutation as MetadataxMutation, Query as MetadataxQuery

from .api.schema import ApiQuery
from .osmosewebsite.schema import OSmOSEWebsiteQuery, WebsiteProjectNode


class DeploymentFilter(MetadataxDeploymentFilter):
    """Override of Metadatax deployment filter"""

    project__website_project__id = NumberFilter()

    class Meta(MetadataxDeploymentFilter.Meta):
        """Override of Metadatax deployment filter"""

        # pylint: disable=missing-docstring


class DeploymentNode(MetadataxDeploymentNode):
    """Override of Metadatax deployment node"""

    class Meta:
        # pylint: disable=missing-docstring, too-few-public-methods
        model = Deployment
        fields = "__all__"
        filterset_class = DeploymentFilter
        interfaces = (relay.Node,)


class ProjectNodeOverride(MetadataxProjectNode):
    website_project = Field(WebsiteProjectNode)

    class Meta:
        model = Project
        fields = "__all__"
        filterset_class = ProjectFilter
        interfaces = (relay.Node,)


class Query(
    ApiQuery,
    OSmOSEWebsiteQuery,
    MetadataxQuery,
    graphene.ObjectType,
):
    """Global query"""

    # pylint: disable=too-few-public-methods

    all_deployments = DjangoPaginationConnectionField(DeploymentNode)
    all_projects = DjangoPaginationConnectionField(ProjectNodeOverride)


class Mutation(
    MetadataxMutation, graphene.ObjectType
):  # pylint: disable=too-few-public-methods
    """Global mutation"""


schema = graphene.Schema(query=Query, mutation=Mutation)
