"""GraphQL Schema for OSmOSE Website"""
import graphene
from graphene import Field, ID
from graphene_django_pagination import DjangoPaginationConnectionField

from backend.osmosewebsite.models import Project as WebsiteProject
from .project import WebsiteProjectNode


class OSmOSEWebsiteQuery(graphene.ObjectType):
    """OSmOSE Website query"""

    # pylint: disable=too-few-public-methods

    all_website_projects = DjangoPaginationConnectionField(WebsiteProjectNode)
    website_projet_by_id = Field(WebsiteProjectNode, pk=ID(required=True))

    def resolve_website_projet_by_id(
        self, info, pk: str
    ):  # pylint: disable=unused-argument
        """Return website project by id"""
        return WebsiteProject.objects.get(pk=pk)
