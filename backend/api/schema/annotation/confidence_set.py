"""ConfidenceSet schema"""
from graphene import relay

from backend.api.models import ConfidenceSet
from backend.utils.schema import ApiObjectType


class ConfidenceSetNode(ApiObjectType):
    """ConfidenceSet schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = ConfidenceSet
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
