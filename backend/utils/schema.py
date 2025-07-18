"""GraphQL util methods"""
import logging
import traceback
from enum import Enum

from graphene_django_pagination import DjangoPaginationConnectionField
from graphql import GraphQLResolveInfo
from rest_framework import status
from rest_framework.exceptions import APIException
from typing_extensions import Optional

from backend.aplose.models import User

logger = logging.getLogger(__name__)


class GraphQLPermissions(Enum):
    is_authenticated = 1
    is_staff_or_superuser = 2
    is_superuser = 3


class GraphQLResolve(object):
    def __init__(self, permission: GraphQLPermissions):
        self.permission = permission

    def __call__(self, fn, *args, **kwargs):
        def wrapper(*args, **kwargs):
            info: Optional[GraphQLResolveInfo] = args[1]

            self.check_permission(info.context.user)

            try:
                return fn(*args, **kwargs)
                print("no error")
            except Exception as e:
                print("catch error")
                print(traceback.format_exc())

                # Capture the full traceback in your console
                logger.error(traceback.format_exc())

                # return error to client
                raise e

        return wrapper

    def check_permission(self, user: User):
        """Check user responds to the given permission"""
        if self.permission in [
            GraphQLPermissions.is_authenticated,
            GraphQLPermissions.is_staff_or_superuser,
            GraphQLPermissions.is_superuser,
        ]:
            if not user.is_authenticated:
                raise APIException("Unauthorized", code=status.HTTP_401_UNAUTHORIZED)

        if self.permission == GraphQLPermissions.is_staff_or_superuser:
            if not (user.is_staff or user.is_superuser):
                raise APIException("Forbidden", code=status.HTTP_403_FORBIDDEN)
        if self.permission == GraphQLPermissions.is_superuser:
            if not user.is_superuser:
                raise APIException("Forbidden", code=status.HTTP_403_FORBIDDEN)


class AuthenticatedDjangoConnectionField(DjangoPaginationConnectionField):
    @classmethod
    def resolve_queryset(
        cls, connection, iterable, info, args, filtering_args, filterset_class
    ):
        if not info.context.user.is_authenticated:
            raise APIException("Unauthorized", code=status.HTTP_401_UNAUTHORIZED)
        return super().resolve_queryset(
            connection, iterable, info, args, filtering_args, filterset_class
        )


class StaffGraphQLConnectionField(DjangoPaginationConnectionField):
    @classmethod
    def resolve_queryset(
        cls, connection, iterable, info, args, filtering_args, filterset_class
    ):
        if not info.context.user.is_authenticated:
            raise APIException("Unauthorized", code=status.HTTP_401_UNAUTHORIZED)
        if not (info.context.user.is_staff or info.context.user.is_superuser):
            raise APIException("Forbidden", code=status.HTTP_403_FORBIDDEN)
        return super().resolve_queryset(
            connection, iterable, info, args, filtering_args, filterset_class
        )


class SuperuserGraphQLConnectionField(DjangoPaginationConnectionField):
    @classmethod
    def resolve_queryset(
        cls, connection, iterable, info, args, filtering_args, filterset_class
    ):
        if not info.context.user.is_authenticated:
            raise APIException("Unauthorized", code=status.HTTP_401_UNAUTHORIZED)
        if not info.context.user.is_superuser:
            raise APIException("Forbidden", code=status.HTTP_403_FORBIDDEN)
        return super().resolve_queryset(
            connection, iterable, info, args, filtering_args, filterset_class
        )
