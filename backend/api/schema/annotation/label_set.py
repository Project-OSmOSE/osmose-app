"""LabelSet schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import LabelSet


class LabelSetNode(DjangoObjectType):
    """LabelSet schema"""

    id = ID(required=True)

    class Meta:
        model = LabelSet
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
