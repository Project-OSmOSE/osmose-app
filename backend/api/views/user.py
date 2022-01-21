"""User DRF-Viewset file"""

from django.http import HttpResponse
from django.contrib.auth.models import User
from django.db import IntegrityError

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema, inline_serializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    def create(self, validated_data):
        return User.objects.create_user(
            validated_data['username'], validated_data['email'], validated_data['password']
        )

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

    @extend_schema(request=UserCreateSerializer, responses=UserSerializer)
    def create(self, request):
        """Create new user, only available to staff"""
        if not request.user.is_staff:
            return HttpResponse('Unauthorized', status=401)

        create_serializer = UserCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        try:
            user = create_serializer.save()
        except IntegrityError as error:
            return HttpResponse(error, status=400)
        serializer = UserSerializer(user)
        return Response(serializer.data)
