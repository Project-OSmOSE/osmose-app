"""API GraphQL schemas"""
import graphene

from .annotation import APIAnnotationQuery
from .common import APICommonQuery
from .data import APIDataQuery


class APIQuery(
    APIAnnotationQuery,
    APICommonQuery,
    APIDataQuery,
    graphene.ObjectType,
):  # pylint: disable=too-few-public-methods
    """API GraphQL queries"""
