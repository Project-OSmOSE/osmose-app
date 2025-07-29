"""Confidence schema"""
from graphene import relay

from backend.api.models import Confidence
from backend.utils.schema import ApiObjectType


class ConfidenceNode(ApiObjectType):
    """Confidence schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Confidence
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
