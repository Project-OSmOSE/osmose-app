"""User GraphQL definitions"""
from django.db.models import Case, F, When, Value
from django.db.models.functions import Concat
from graphene import relay, String

from backend.aplose.models import User
from backend.utils.schema import ApiObjectType


class UserNode(ApiObjectType):
    """User node"""

    display_name = String()

    class Meta:
        # pylint: disable=too-few-public-methods, missing-class-docstring
        model = User
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)

    @classmethod
    def get_queryset(cls, queryset, info):
        field_names = cls._get_query_field_names(info)

        cls._init_queryset_extensions()
        if "displayName" in field_names:
            cls.annotations = {
                **cls.annotations,
                "display_name": Case(
                    When(
                        first_name__isnull=False,
                        last_name__isnull=False,
                        then=Concat("first_name", Value(" "), "last_name"),
                    ),
                    default=F("username"),
                ),
            }
        return cls._finalize_queryset(super().get_queryset(queryset, info))
