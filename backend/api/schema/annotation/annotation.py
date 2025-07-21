"""Annotation schema"""
from graphene import relay

from backend.api.models import Annotation
from backend.utils.schema import ApiObjectType


class AnnotationNode(ApiObjectType):
    """Annotation schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Annotation
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
