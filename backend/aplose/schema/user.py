from django.db.models import QuerySet, Case, F, When, Value
from django.db.models.functions import Concat
from graphene import relay, String

from backend.aplose.models import User
from backend.utils.schema import ApiObjectType


class UserNode(ApiObjectType):

    display_name = String()

    class Meta:
        model = User
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)

    @classmethod
    def get_queryset(cls, queryset, info):
        field_names = cls._get_query_field_names(info)

        annotations = {}
        if "displayName" in field_names:
            annotations = {
                **annotations,
                "display_name": Case(
                    When(first_name__isnull=False, last_name__isnull=False, then=Concat("first_name", Value(' '), "last_name")),
                    default=F('username')
                ),
            }
        return (
            super()
            .get_queryset(queryset, info)
            .annotate(**annotations)
        )

