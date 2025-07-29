"""AnnotationComment schema"""
from graphene import relay

from backend.api.models import AnnotationComment
from backend.utils.schema import ApiObjectType


class AnnotationCommentNode(ApiObjectType):
    """AnnotationComment schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AnnotationComment
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
