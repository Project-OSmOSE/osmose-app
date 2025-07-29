"""FFT schema"""
from graphene import relay

from backend.api.models import FFT
from backend.utils.schema import ApiObjectType


class FFTNode(ApiObjectType):
    """FFT schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = FFT
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
