"""AnnotationFileRange schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import AnnotationFileRange


class AnnotationFileRangeNode(DjangoObjectType):
    """AnnotationFileRange schema"""

    id = ID(required=True)

    class Meta:
        model = AnnotationFileRange
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
