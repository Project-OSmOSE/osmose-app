"""AnnotationFileRange schema"""
from graphene import relay

from backend.api.models import AnnotationFileRange
from backend.utils.schema import ApiObjectType


class AnnotationFileRangeNode(ApiObjectType):
    """AnnotationFileRange schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AnnotationFileRange
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
