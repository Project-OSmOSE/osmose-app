"""AcousticFeatures schema"""
from graphene import relay

from backend.api.models import AcousticFeatures
from backend.utils.schema import ApiObjectType


class AcousticFeaturesNode(ApiObjectType):
    """AcousticFeatures schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AcousticFeatures
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
