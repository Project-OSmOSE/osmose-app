"""User DRF-Viewset file"""

from django.db.models.functions import Lower
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.aplose_auth.models import User
from backend.aplose_auth.serializers import UserSerializer


class UserViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for user-related actions
    """

    serializer_class = UserSerializer

    def list(self, request):
        """List users"""
        queryset = User.objects.all().order_by(Lower("email"))
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        responses=inline_serializer(
            "is_staff_response", {"is_staff": serializers.BooleanField()}
        )
    )
    @action(detail=False)
    def is_staff(self, request):
        """Informs whether current user is staff or not"""
        return Response({"is_staff": request.user.is_staff})
