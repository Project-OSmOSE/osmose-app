"""SpectrogramAnalysis schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import SpectrogramAnalysis


class SpectrogramAnalysisNode(DjangoObjectType):
    """SpectrogramAnalysis schema"""

    id = ID(required=True)

    class Meta:
        model = SpectrogramAnalysis
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
