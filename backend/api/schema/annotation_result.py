import graphene
from django_filters import FilterSet, NumberFilter
from graphene import relay
from graphene_django import DjangoObjectType

from backend.api.models import AnnotationResult


class AnnotationResultFilter(FilterSet):

    annotation_campaign_phase__annotation_campaign__datasets__related_channel_configuration__deployment_id = NumberFilter(
        distinct=True,
    )

    class Meta:
        model = AnnotationResult
        fields = {
            "id": ["exact", "in"],
        }


class AnnotationResultNode(DjangoObjectType):
    id = graphene.ID(required=True)

    class Meta:
        model = AnnotationResult
        fields = "__all__"
        filterset_class = AnnotationResultFilter
        interfaces = (relay.Node,)
