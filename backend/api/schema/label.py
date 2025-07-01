"""Label graphql definitions"""
import graphene
from django_filters import FilterSet, NumberFilter, OrderingFilter
from graphene import relay
from graphene_django import DjangoObjectType
from graphene_django_pagination import DjangoPaginationConnectionField

from backend.api.models import Label
from .annotation_result import AnnotationResultNode


class LabelFilter(FilterSet):
    """Label filter"""

    annotationresult__annotation_campaign_phase__annotation_campaign__datasets__related_channel_configuration__deployment_id = NumberFilter(
        distinct=True,
    )

    order_by = OrderingFilter(fields=("id",))

    class Meta:
        model = Label
        fields = {
            "id": ["exact", "in"],
        }


class ApiLabelNode(DjangoObjectType):
    """Label node"""

    id = graphene.ID(required=True)

    annotationresult_set = DjangoPaginationConnectionField(AnnotationResultNode)

    class Meta:
        model = Label
        fields = "__all__"
        filterset_class = LabelFilter
        interfaces = (relay.Node,)
