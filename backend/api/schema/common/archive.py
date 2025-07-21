"""Archive schema"""
from graphene import relay

from backend.api.models import Archive
from backend.utils.schema import ApiObjectType


class ArchiveNode(ApiObjectType):
    """Archive schema"""

    class Meta:
        # pylint: disable=missing-class-docstring, too-few-public-methods
        model = Archive
        fields = "__all__"
        filter_fields = "__all__"
        interfaces = (relay.Node,)
