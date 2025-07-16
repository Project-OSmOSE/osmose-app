"""AcousticFeatures schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import AcousticFeatures


class AcousticFeaturesNode(DjangoObjectType):
    """AcousticFeatures schema"""

    id = ID(required=True)

    class Meta:
        model = AcousticFeatures
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
