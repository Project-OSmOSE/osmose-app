"""GraphQL Schema"""
import graphene
from django_filters import NumberFilter
from graphene import relay
from graphene_django_pagination import DjangoPaginationConnectionField
from metadatax.acquisition.models import Deployment
from metadatax.acquisition.schema.deployment import (
    DeploymentNode as MetadataxDeploymentNode,
    DeploymentFilter as MetadataxDeploymentFilter,
)
from metadatax.schema import Query as MetadataxQuery

from .api.schema import ApiQuery
from .osmosewebsite.schema import OSmOSEWebsiteQuery


class DeploymentFilter(MetadataxDeploymentFilter):
    """Override of Metadatax deployment filter"""

    project__website_project__id = NumberFilter()

    class Meta(MetadataxDeploymentFilter.Meta):
        """Override of Metadatax deployment filter"""

        # pylint: disable=missing-docstring
        pass


class DeploymentNode(MetadataxDeploymentNode):
    """Override of Metadatax deployment node"""

    class Meta:
        model = Deployment
        fields = "__all__"
        filterset_class = DeploymentFilter
        interfaces = (relay.Node,)


class Query(
    ApiQuery,
    OSmOSEWebsiteQuery,
    MetadataxQuery,
    graphene.ObjectType,
):
    """Global query"""

    all_deployments = DjangoPaginationConnectionField(DeploymentNode)


schema = graphene.Schema(query=Query)
