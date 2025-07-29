"""Colormap model"""
from graphene import relay

from backend.api.models import Colormap
from backend.utils.schema import ApiObjectType


class ColormapNode(ApiObjectType):
    """Colormap schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Colormap
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
