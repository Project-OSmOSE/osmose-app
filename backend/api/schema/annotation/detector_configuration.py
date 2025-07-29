"""DetectorConfiguration schema"""
from graphene import relay

from backend.api.models import DetectorConfiguration
from backend.utils.schema import ApiObjectType


class DetectorConfigurationNode(ApiObjectType):
    """DetectorConfiguration schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = DetectorConfiguration
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
