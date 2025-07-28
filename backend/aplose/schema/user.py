from graphene import relay

from backend.aplose.models import User
from backend.utils.schema import ApiObjectType


class UserNode(ApiObjectType):
    class Meta:
        model = User
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
