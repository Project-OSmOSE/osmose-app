"""FFT schema"""
from graphene import relay, ID
from graphene_django import DjangoObjectType

from backend.api.models import FFT


class FFTNode(DjangoObjectType):
    """FFT schema"""

    id = ID(required=True)

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = FFT
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
