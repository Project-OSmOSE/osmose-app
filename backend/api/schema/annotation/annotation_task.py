"""AnnotationTask schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import AnnotationTask


class AnnotationTaskNode(DjangoObjectType):
    """AnnotationTask schema"""

    id = ID(required=True)

    class Meta:
        model = AnnotationTask
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
