"""scales schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import LinearScale, MultiLinearScale


class LinearScaleNode(DjangoObjectType):
    """LinearScale schema"""

    id = ID(required=True)

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = LinearScale
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)


class MultiLinearScaleNode(DjangoObjectType):
    """MultiLinearScale schema"""

    id = ID(required=True)

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = MultiLinearScale
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
