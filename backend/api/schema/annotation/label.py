"""Label schema"""
from graphene import relay

from backend.api.models import Label
from backend.utils.schema import ApiObjectType


class LabelNode(ApiObjectType):
    """Label schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Label
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
