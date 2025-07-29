"""AnnotationValidation schema"""
from graphene import relay

from backend.api.models import AnnotationValidation
from backend.utils.schema import ApiObjectType


class AnnotationValidationNode(ApiObjectType):
    """AnnotationValidation schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AnnotationValidation
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
