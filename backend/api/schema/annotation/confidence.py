"""Confidence schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import Confidence


class ConfidenceNode(DjangoObjectType):
    """Confidence schema"""

    id = ID(required=True)

    class Meta:
        model = Confidence
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
