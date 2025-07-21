"""AnnotationTask schema"""
from graphene import relay

from backend.api.models import AnnotationTask
from backend.utils.schema import ApiObjectType


class AnnotationTaskNode(ApiObjectType):
    """AnnotationTask schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AnnotationTask
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
