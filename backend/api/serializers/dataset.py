"""Dataset DRF serializers file"""

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field

from backend.api.models import Dataset, SpectroConfig


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
