"""Spectrogram schema"""
from graphene import relay

from backend.api.models import Spectrogram
from backend.utils.schema import ApiObjectType


class SpectrogramNode(ApiObjectType):
    """Spectrogram schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Spectrogram
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
