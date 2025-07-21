"""AnnotationPhase schema"""
from graphene import relay

from backend.api.models import AnnotationPhase
from backend.utils.schema import ApiObjectType


class AnnotationPhaseNode(ApiObjectType):
    """AnnotationPhase schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AnnotationPhase
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
