"""User DRF-Viewset file"""

from django.contrib.auth.models import User

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema, inline_serializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

class UserViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for user-related actions
    """

    serializer_class = UserSerializer

    def list(self, request):
        """List users"""
        queryset = User.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(responses=inline_serializer('is_staff_response', {'is_staff': serializers.BooleanField()}))
    @action(detail=False)
    def is_staff(self, request):
        """Informs whether current user is staff or not"""
        return Response({'is_staff': request.user.is_staff})
