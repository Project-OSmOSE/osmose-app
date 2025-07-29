"""GraphQL util methods"""
import logging
import traceback
from enum import Enum

import graphene_django_optimizer as gql_optimizer
from graphene import ID
from graphene_django import DjangoObjectType
from graphene_django.views import GraphQLView
from graphene_django_pagination import DjangoPaginationConnectionField
from graphql import GraphQLResolveInfo
from rest_framework import status
from rest_framework.decorators import (
    permission_classes,
    authentication_classes,
    api_view,
)
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.settings import api_settings
from typing_extensions import Optional

from backend.aplose.models import User

logger = logging.getLogger(__name__)


class GraphQLPermissions(Enum):
    """GraphQL access permission"""

    AUTHENTICATED = 1
    STAFF_OR_SUPERUSER = 2
    SUPERUSER = 3


class GraphQLResolve:
    """GraphQL resolver - handles permissions"""

    def __init__(self, permission: GraphQLPermissions):
        self.permission = permission

    def __call__(self, fn, *args, **kwargs):
        def wrapper(*args, **kwargs):
            info: Optional[GraphQLResolveInfo] = args[1]

            self.check_permission(info.context.user)

            try:
                return fn(*args, **kwargs)
            except Exception as e:
                print(traceback.format_exc())

                # Capture the full traceback in your console
                logger.error(traceback.format_exc())

                # return error to client
                raise e

        return wrapper

    def check_permission(self, user: User):
        """Check user responds to the given permission"""
        if self.permission in [
            GraphQLPermissions.AUTHENTICATED,
            GraphQLPermissions.STAFF_OR_SUPERUSER,
            GraphQLPermissions.SUPERUSER,
        ]:
            if not user.is_authenticated:
                raise APIException("Unauthorized", code=status.HTTP_401_UNAUTHORIZED)

        if self.permission == GraphQLPermissions.STAFF_OR_SUPERUSER:
            if not (user.is_staff or user.is_superuser):
                raise APIException("Forbidden", code=status.HTTP_403_FORBIDDEN)
        if self.permission == GraphQLPermissions.SUPERUSER:
            if not user.is_superuser:
                raise APIException("Forbidden", code=status.HTTP_403_FORBIDDEN)


class AuthenticatedDjangoConnectionField(DjangoPaginationConnectionField):
    """Extended DjangoPaginationConnectionField - Only allow authenticated queries"""

    # pylint: disable=too-many-positional-arguments, too-many-arguments
    @classmethod
    def resolve_queryset(
        cls, connection, iterable, info, args, filtering_args, filterset_class
    ):
        if not info.context.user.is_authenticated:
            raise APIException("Unauthorized", code=status.HTTP_401_UNAUTHORIZED)
        return super().resolve_queryset(
            connection, iterable, info, args, filtering_args, filterset_class
        )


class ApiObjectType(DjangoObjectType):
    """Dataset schema"""

    id = ID(required=True)

    annotations = {}
    prefetch = []
    select = []

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        abstract = True

    @classmethod
    def get_queryset(cls, queryset, info):
        return gql_optimizer.query(queryset, info)

    @classmethod
    def _get_query_field_names(cls, info):
        query_fields = info.field_nodes[0].selection_set.selections
        if "results" in [f.name.value for f in query_fields]:
            query_fields = query_fields[0].selection_set.selections
        return [f.name.value for f in query_fields]

    @classmethod
    def _init_queryset_extensions(cls):
        """Initialize select, prefetch and annotations"""
        cls.annotations = {}
        cls.prefetch = []
        cls.select = []

    @classmethod
    def _finalize_queryset(cls, queryset):
        """Finalize queryset select, prefetch, annotation"""
        return queryset.select_related(*cls.select).prefetch_related(*cls.prefetch).annotate(**cls.annotations)


class DRFAuthenticatedGraphQLView(GraphQLView):
    """Allow GraphQL to handle REST authenticated users"""

    def parse_body(self, request):
        if isinstance(request, Request):
            return request.data
        return super().parse_body(request)

    @classmethod
    def as_view(cls, *args, **kwargs):
        view = super().as_view(*args, **kwargs)
        view = permission_classes((IsAuthenticated,))(view)
        view = authentication_classes(api_settings.DEFAULT_AUTHENTICATION_CLASSES)(view)
        view = api_view(["GET", "POST"])(view)
        return view
