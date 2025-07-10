"""OSmOSE Website Views - Team Member"""
from rest_framework import viewsets, permissions

from backend.osmosewebsite.models.team_member import TeamMember
from backend.osmosewebsite.serializers.team_member import TeamMemberSerializer


class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    `list`, `create`, `retrieve`, `update` and `destroy` team members.
    """

    queryset = TeamMember.objects.select_related("contact")
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
