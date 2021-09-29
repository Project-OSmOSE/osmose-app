"""User DRF-Viewset file"""

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema_field

from backend.api.models import AnnotationSet

class AnnotationSetSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = AnnotationSet
        fields = ['id', 'name', 'desc', 'tags']

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_tags(self, annotation_set):
        return list(annotation_set.tags.values_list('name', flat=True))

class AnnotationSetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for user-related actions
    """

    serializer_class = AnnotationSetSerializer

    def list(self, request):
        """List users"""
        queryset = AnnotationSet.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
