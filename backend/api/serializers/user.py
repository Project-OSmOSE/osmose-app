"""User DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, no-self-use, abstract-method

from rest_framework import serializers

from backend.api.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic User data"""

    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserCreateSerializer(serializers.Serializer):
    """Serializer meant for User creation"""

    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    def create(self, validated_data):
        return User.objects.create_user(
            validated_data["username"],
            validated_data["email"],
            validated_data["password"],
        )
