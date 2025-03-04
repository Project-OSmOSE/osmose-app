from rest_framework import serializers

from backend.aplose.models import AnnotatorGroup
from .user import UserSerializer


class AnnotatorGroupSerializer(serializers.ModelSerializer):

    annotators = UserSerializer(many=True, read_only=True)

    class Meta:
        model = AnnotatorGroup
        fields = "__all__"