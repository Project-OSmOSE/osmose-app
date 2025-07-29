"""scales schema"""
from graphene import relay

from backend.api.models import LinearScale, MultiLinearScale
from backend.utils.schema import ApiObjectType


class LinearScaleNode(ApiObjectType):
    """LinearScale schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = LinearScale
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)


class MultiLinearScaleNode(ApiObjectType):
    """MultiLinearScale schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = MultiLinearScale
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
