"""GraphQL Schema"""
import graphene
from django import http
from django_filters import NumberFilter
from graphene import relay
from graphene_django.rest_framework.mutation import SerializerMutation
from graphene_django_pagination import DjangoPaginationConnectionField
from metadatax.acquisition.models import Deployment
from metadatax.acquisition.schema.deployment import (
    DeploymentNode as MetadataxDeploymentNode,
    DeploymentFilter as MetadataxDeploymentFilter,
)
from metadatax.ontology.models import Source
from metadatax.ontology.schema import SourceNode
from metadatax.ontology.serializers import SourceSerializer
from metadatax.schema import Query as MetadataxQuery, Mutation as MetadataxMutation

from .api.schema import ApiQuery
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
        # pylint: disable=missing-docstring
        model = Deployment
        fields = "__all__"
        filterset_class = DeploymentFilter
        interfaces = (relay.Node,)


class OntologySourceMutation(SerializerMutation):
    source = graphene.Field(SourceNode)

    class Meta:
        serializer_class = SourceSerializer
        model_operations = ["create", "update"]
        lookup_field = "id"
        exclude_fields = ["related_bibliography"]

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        print("get_serializer_kwargs", root, info, input)
        if "id" in input:
            instance = Source.objects.filter(id=input["id"]).first()
            if instance:
                return {"instance": instance, "data": input, "partial": True}

            else:
                raise http.Http404

        return {"data": input, "partial": True}


class Query(
    ApiQuery,
    OSmOSEWebsiteQuery,
    MetadataxQuery,
    graphene.ObjectType,
):
    """Global query"""

    all_deployments = DjangoPaginationConnectionField(DeploymentNode)


class Mutation(MetadataxMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
