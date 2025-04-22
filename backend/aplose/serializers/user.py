"""User DRF serializers file"""
from django.contrib.auth.password_validation import validate_password
from django.template.defaultfilters import upper
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from backend.aplose.models import User
from backend.aplose.models.user import ExpertiseLevel
from backend.utils.serializers import EnumField


# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method


class UserDisplayNameSerializer(serializers.SlugRelatedField):
    def __init__(self, **kwargs):
        kwargs.pop("read_only")
        super().__init__(slug_field="username", read_only=True, **kwargs)

    def to_representation(self, user: User) -> str:
        name = super().to_representation(user)
        if user.first_name and user.last_name:
            name = f"{user.first_name} {upper(user.last_name)}"
        return name


class UserSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic User data"""

    id = serializers.PrimaryKeyRelatedField(read_only=True)

    username = serializers.CharField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)

    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())],
    )

    expertise_level = EnumField(
        enum=ExpertiseLevel,
        source="aplose.expertise_level",
        read_only=True,
    )

    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

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
    """Update password serializer"""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
