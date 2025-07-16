"""ConfidenceSet schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import ConfidenceSet


class ConfidenceSetNode(DjangoObjectType):
    """ConfidenceSet schema"""

    id = ID(required=True)

    class Meta:
        model = ConfidenceSet
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
