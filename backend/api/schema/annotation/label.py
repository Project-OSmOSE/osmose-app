"""Label schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import Label


class LabelNode(DjangoObjectType):
    """Label schema"""

    id = ID(required=True)

    class Meta:
        model = Label
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
