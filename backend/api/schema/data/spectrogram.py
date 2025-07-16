"""Spectrogram schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import Spectrogram


class SpectrogramNode(DjangoObjectType):
    """Spectrogram schema"""

    id = ID(required=True)

    class Meta:
        model = Spectrogram
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
