"""Dataset DRF-Viewset file"""

import csv
from datetime import timedelta

from django.db.models import Count
from django.utils.dateparse import parse_datetime
from django.http import HttpResponse
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema_field, extend_schema

from backend.api.models import Dataset, DatasetType, AudioMetadatum, GeoMetadatum, SpectroConfig
from backend.settings import DATASET_IMPORT_FOLDER, DATASET_SPECTRO_FOLDER, DATASET_FILES_FOLDER, DATASET_EXPORT_PATH


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

    @transaction.atomic
    @action(detail=False)
    def datawork_import(self, request):
        """Import new datasets from datawork"""
        if not request.user.is_staff:
            return HttpResponse('Unauthorized', status=401)

        dataset_names = Dataset.objects.values_list('name', flat=True)
        csv_dataset_names = []
        new_datasets = []

        # Check for new datasets
        with open(DATASET_IMPORT_FOLDER / 'datasets.csv') as csvfile:
            for dataset in csv.DictReader(csvfile):
                csv_dataset_names.append(dataset['name'])
                if dataset['name'] not in dataset_names:
                    new_datasets.append(dataset)

        created_datasets = []
        for dataset in new_datasets:
            # Create dataset metadata
            datatype, _ = DatasetType.objects.update_or_create(
                name=dataset['dataset_type_name'],
                defaults={'desc': dataset['dataset_type_desc']}
            )
            with open(DATASET_IMPORT_FOLDER / dataset['folder_name'] / 'raw/metadata.csv') as csvfile:
                 audio_raw = list(csv.DictReader(csvfile))[0]
            audio_metadatum = AudioMetadatum.objects.create(
                num_channels=audio_raw['nchannels'],
                sample_rate_khz=audio_raw['orig_fs'],
                sample_bits=audio_raw['sound_sample_size_in_bits'],
                start=parse_datetime(audio_raw['start_date']),
                end=parse_datetime(audio_raw['end_date'])
            )
            geo_metadatum, _ = GeoMetadatum.objects.update_or_create(
                name=dataset['location_name'],
                defaults={'desc': dataset['location_desc']}
            )

            # Create dataset
            curr_dataset = Dataset.objects.create(
                name=dataset['name'],
                dataset_path=DATASET_EXPORT_PATH / dataset['folder_name'],
                status=1,
                files_type=dataset['files_type'],
                dataset_type=datatype,
                dataset_conf=dataset['conf_folder'],
                start_date=audio_metadatum.start.date(),
                end_date=audio_metadatum.end.date(),
                audio_metadatum=audio_metadatum,
                geo_metadatum=geo_metadatum,
                owner=request.user,
            )
            created_datasets.append(curr_dataset.id)

            # Create dataset_files
            with open(DATASET_IMPORT_FOLDER / dataset['folder_name'] / DATASET_FILES_FOLDER / 'timestamp.csv') as csvfile:
                for timestamp_data in csv.reader(csvfile):
                    filename, start_timestamp = timestamp_data
                    start = parse_datetime(start_timestamp)
                    audio_metadatum = AudioMetadatum.objects.create(
                        start=start,
                        end=(start + timedelta(seconds=float(audio_raw['audioFile_duration'])))
                    )
                    curr_dataset.files.create(
                        filename=filename,
                        filepath=DATASET_FILES_FOLDER / dataset['conf_folder'] / filename,
                        size=0,
                        audio_metadatum=audio_metadatum
                    )

        # Check for new spectro configs
        datasets_to_check = Dataset.objects.filter(name__in=csv_dataset_names)
        for dataset in datasets_to_check:
            dataset_spectros = []
            dataset_folder = dataset.dataset_path.split('/')[-1]
            conf_folder = dataset.dataset_conf or ''
            spectro_csv_path = DATASET_IMPORT_FOLDER / dataset_folder / DATASET_SPECTRO_FOLDER / conf_folder / 'spectrograms.csv'
            with open(spectro_csv_path) as csvfile:
                for spectro in csv.DictReader(csvfile):
                    name = spectro.pop('name')
                    dataset_spectros.append(
                        SpectroConfig.objects.update_or_create(name=name, defaults=spectro)[0]
                    )
            dataset.spectro_configs.set(dataset_spectros)

        queryset = Dataset.objects.filter(id__in=created_datasets).annotate(Count('files')).select_related('dataset_type')
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
