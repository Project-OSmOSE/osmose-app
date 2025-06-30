import graphene
from graphene_django_pagination import DjangoPaginationConnectionField

from .project import ProjectNode


class OSmOSEWebsiteQuery(graphene.ObjectType):

    all_website_projects = DjangoPaginationConnectionField(ProjectNode)
