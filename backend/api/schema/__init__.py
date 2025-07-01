import graphene
from graphene_django_pagination import DjangoPaginationConnectionField

from .annotation_result import AnnotationResultNode
from .label import ApiLabelNode


class ApiQuery(graphene.ObjectType):

    all_api_annotation_results = DjangoPaginationConnectionField(AnnotationResultNode)
    all_api_labels = DjangoPaginationConnectionField(ApiLabelNode)
