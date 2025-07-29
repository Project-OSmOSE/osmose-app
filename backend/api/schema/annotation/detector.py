"""Detector schema"""
from graphene import relay

from backend.api.models import Detector
from backend.utils.schema import ApiObjectType


class DetectorNode(ApiObjectType):
    """Detector schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Detector
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
