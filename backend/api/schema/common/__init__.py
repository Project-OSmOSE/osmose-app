"""API common models"""
import graphene

from backend.utils.schema import AuthenticatedDjangoConnectionField
from .archive import ArchiveNode


class APICommonQuery(graphene.ObjectType):  # pylint: disable=too-few-public-methods
    """API GraphQL queries"""

    all_archives = AuthenticatedDjangoConnectionField(ArchiveNode)
