"""Dataset DRF-Viewset file"""

from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema_field, extend_schema
from sentry_sdk import capture_exception

from backend.api.models import Dataset, SpectroConfig
from backend.api.actions import datawork_import


class SpectroConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpectroConfig
        fields = '__all__'


class DatasetSerializer(serializers.ModelSerializer):
    files_count = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    spectros = SpectroConfigSerializer(many=True, source='spectro_configs')

    class Meta:
        model = Dataset
        fields = ['id', 'name', 'files_type', 'start_date', 'end_date', 'files_count', 'type', 'spectros']
        depth = 1

    @extend_schema_field(serializers.IntegerField)
    def get_files_count(self, dataset):
        return dataset.files__count

    @extend_schema_field(serializers.CharField)
    def get_type(self, dataset):
        return dataset.dataset_type.name


class DatasetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for dataset-related actions
    """

    serializer_class = DatasetSerializer

    def list(self, request):
        """List available datasets"""
        queryset = Dataset.objects.annotate(Count('files')).select_related('dataset_type')
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def datawork_import(self, request):
        """Import new datasets from datawork"""
        if not request.user.is_staff:
            return HttpResponse('Unauthorized', status=401)

        try:
            new_datasets = datawork_import(importer=request.user)
        except FileNotFoundError as error:
            capture_exception(error)
            return HttpResponse(error, status=400)
        except KeyError as error:
            capture_exception(error)
            return HttpResponse(f'One of the import CSV is missing the following column : {error}', status=400)

        queryset = new_datasets.annotate(Count('files')).select_related('dataset_type')
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
