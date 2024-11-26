"""User DRF-Viewset file"""

from django.db.models.functions import Lower
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import viewsets, serializers, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.aplose.models import User
from backend.aplose.serializers import UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for user-related actions
    """

    queryset = User.objects.all().order_by(Lower("email"))
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses=inline_serializer(
            "is_staff_response", {"is_staff": serializers.BooleanField()}
        )
    )
    @action(detail=False)
    def self(self, request):
        """Informs whether current user is staff or not"""
        return Response(
            self.get_serializer_class()(request.user).data, status=status.HTTP_200_OK
        )
