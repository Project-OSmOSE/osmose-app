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
