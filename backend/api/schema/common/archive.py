"""Archive schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import Archive


class ArchiveNode(DjangoObjectType):
    """Archive schema"""

    id = ID(required=True)

    class Meta:
        model = Archive
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
