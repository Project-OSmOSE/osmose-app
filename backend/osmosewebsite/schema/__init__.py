"""GraphQL Schema for OSmOSE Website"""
import graphene
from graphene import Field, ID, relay
from graphene_django_pagination import DjangoPaginationConnectionField
from metadatax.acquisition.models import Project
from metadatax.acquisition.schema import ProjectNode as _ProjectNode
from metadatax.acquisition.schema.project import ProjectFilter

from backend.osmosewebsite.models import Project as WebsiteProject
from .project import WebsiteProjectNode as WebsiteProjectNode


class ProjectNode(_ProjectNode):
    class Meta:
        model = Project
        fields = "__all__"
        filterset_class = ProjectFilter
        interfaces = (relay.Node,)

    website_project = Field(WebsiteProjectNode)

    @staticmethod
    def resolve_website_project(parent, info, **kwargs):
        print(parent, info, kwargs)


class OSmOSEWebsiteQuery(graphene.ObjectType):
    """OSmOSE Website query"""

    # pylint: disable=too-few-public-methods

    all_website_projects = DjangoPaginationConnectionField(WebsiteProjectNode)
    website_projet_by_id = Field(WebsiteProjectNode, id=ID(required=True))

    def resolve_website_projet_by_id(self, info, id: str):
        """Return website project by id"""
        return WebsiteProject.objects.get(pk=id)
