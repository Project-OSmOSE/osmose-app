"""User DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from backend.aplose.models import User
from backend.aplose.models.user import ExpertiseLevel
from backend.utils.serializers import EnumField


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
