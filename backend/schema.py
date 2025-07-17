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
from metadatax.schema import Query as MetadataxQuery, Mutation as MetadataxMutation

from .api.schema import APIQuery
from .osmosewebsite.schema import OSmOSEWebsiteQuery


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


class Query(
    APIQuery,
    OSmOSEWebsiteQuery,
    MetadataxQuery,
    graphene.ObjectType,
):
    """Global query"""

    # pylint: disable=too-few-public-methods

    all_deployments = DjangoPaginationConnectionField(DeploymentNode)


class Mutation(
    MetadataxMutation, graphene.ObjectType
):  # pylint: disable=too-few-public-methods
    """Global mutation"""


schema = graphene.Schema(query=Query, mutation=Mutation)
