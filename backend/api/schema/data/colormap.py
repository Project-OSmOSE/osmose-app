"""Colormap model"""
from graphene import ID, relay
from graphene_django import DjangoObjectType

from backend.api.models import Colormap


class ColormapNode(DjangoObjectType):
    """Colormap schema"""

    id = ID(required=True)

    class Meta:
        model = Colormap
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
