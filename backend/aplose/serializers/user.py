"""User DRF serializers file"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from backend.aplose.models import User
from backend.aplose.models.user import ExpertiseLevel
from backend.utils.serializers import EnumField


# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method


class UserSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic User data"""

    expertise_level = EnumField(enum=ExpertiseLevel, source="aplose.expertise_level")

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "expertise_level",
            "is_staff",
            "is_superuser",
        ]


class UserPasswordUpdateSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
