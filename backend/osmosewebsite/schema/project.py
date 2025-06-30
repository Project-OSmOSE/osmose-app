import graphene
from graphene import relay
from graphene_django import DjangoObjectType

from backend.osmosewebsite.models import Project


class ProjectNode(DjangoObjectType):
    id = graphene.ID(required=True)

    class Meta:
        model = Project
        fields = "__all__"
        filter_fields = ["id"]
        interfaces = (relay.Node,)
