"""GraphQL Schema for OSmOSE Website"""
import graphene
from graphene_django_pagination import DjangoPaginationConnectionField

from .project import ProjectNode


class OSmOSEWebsiteQuery(graphene.ObjectType):
    """OSmOSE Website query"""

    # pylint: disable=too-few-public-methods

    all_website_projects = DjangoPaginationConnectionField(ProjectNode)
