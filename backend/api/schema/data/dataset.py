"""Dataset schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import Dataset


class DatasetNode(DjangoObjectType):
    """Dataset schema"""

    id = ID(required=True)

    class Meta:
        model = Dataset
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
