"""AnnotationCampaign schema"""
from graphene import relay

from backend.api.models import AnnotationCampaign
from backend.utils.schema import ApiObjectType


class AnnotationCampaignNode(ApiObjectType):
    """AnnotationCampaign schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = AnnotationCampaign
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
