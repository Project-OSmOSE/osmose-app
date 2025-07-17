"""Detector schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import Detector


class DetectorNode(DjangoObjectType):
    """Detector schema"""

    id = ID(required=True)

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Detector
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
