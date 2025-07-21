"""LegacySpectrogramConfiguration schema"""
from graphene import relay

from backend.api.models import LegacySpectrogramConfiguration
from backend.utils.schema import ApiObjectType


class LegacySpectrogramConfigurationNode(ApiObjectType):
    """LegacySpectrogramConfiguration schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = LegacySpectrogramConfiguration
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
