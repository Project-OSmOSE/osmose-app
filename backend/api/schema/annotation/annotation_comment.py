"""AnnotationComment schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import AnnotationComment


class AnnotationCommentNode(DjangoObjectType):
    """AnnotationComment schema"""

    id = ID(required=True)

    class Meta:
        model = AnnotationComment
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
