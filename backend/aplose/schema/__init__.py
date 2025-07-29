"""APLOSE queries"""
from graphene import ObjectType

from backend.aplose.schema.user import UserNode
from backend.utils.schema import AuthenticatedDjangoConnectionField


class AploseQuery(ObjectType):  # pylint: disable=too-few-public-methods
    """APLOSE queries"""

    all_users = AuthenticatedDjangoConnectionField(UserNode)
