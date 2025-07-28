"""APLOSE queries"""
from graphene import ObjectType

from backend.aplose.schema.user import UserNode
from backend.utils.schema import AuthenticatedDjangoConnectionField


class AploseQuery(ObjectType):
    """APLOSE queries"""

    all_users = AuthenticatedDjangoConnectionField(UserNode)
