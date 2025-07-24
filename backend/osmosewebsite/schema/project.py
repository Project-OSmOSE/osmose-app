"""Project graphql definitions"""
import graphene
from graphene import relay
from graphene_django import DjangoObjectType

from backend.osmosewebsite.models import Project


class WebsiteProjectNode(DjangoObjectType):
    """Project node"""

    id = graphene.ID(required=True)

    class Meta:
        # pylint: disable=missing-docstring, too-few-public-methods
        model = Project
        fields = "__all__"
        filter_fields = ["id"]
        interfaces = (relay.Node,)

    # Important!
    @classmethod
    def get_queryset(cls, queryset, info):
        print("get_queryset", queryset, info)
        return queryset
