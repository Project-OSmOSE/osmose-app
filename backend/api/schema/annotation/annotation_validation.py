"""AnnotationValidation schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import AnnotationValidation


class AnnotationValidationNode(DjangoObjectType):
    """AnnotationValidation schema"""

    id = ID(required=True)

    class Meta:
        model = AnnotationValidation
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
