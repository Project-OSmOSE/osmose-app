"""AnnotationTask schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import AnnotationTask


class AnnotationTaskNode(DjangoObjectType):
    """AnnotationTask schema"""

    id = ID(required=True)

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AnnotationTask
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
