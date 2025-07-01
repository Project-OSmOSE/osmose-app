"""GraphQL Schema for OSmOSE Website"""
import graphene
from graphene_django_pagination import DjangoPaginationConnectionField

from .project import ProjectNode


class OSmOSEWebsiteQuery(graphene.ObjectType):
    """OSmOSE Website query"""

    all_website_projects = DjangoPaginationConnectionField(ProjectNode)
