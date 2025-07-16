"""AnnotationPhase schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import AnnotationPhase


class AnnotationPhaseNode(DjangoObjectType):
    """AnnotationPhase schema"""

    id = ID(required=True)

    class Meta:
        model = AnnotationPhase
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
