"""Detector schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import Detector


class DetectorNode(DjangoObjectType):
    """Detector schema"""

    id = ID(required=True)

    class Meta:
        model = Detector
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
