"""Annotation task DRF serializers file"""

from datetime import datetime

from django.utils.http import urlquote
from django.conf import settings

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field

from backend.api.models import AnnotationTask, AnnotationResult, SpectroConfig

class AnnotationTaskSerializer(serializers.ModelSerializer):
    filename = serializers.CharField(source='dataset_file.filename')
    dataset_name = serializers.CharField(source='dataset_file.dataset.name')
    start = serializers.DateTimeField(source='dataset_file.audio_metadatum.start')
    end = serializers.DateTimeField(source='dataset_file.audio_metadatum.end')

    class Meta:
        model = AnnotationTask
        fields = ['id', 'status', 'filename', 'dataset_name', 'start', 'end']


class AnnotationTaskBoundarySerializer(serializers.Serializer):
    startTime = serializers.DateTimeField()
    endTime = serializers.DateTimeField()
    startFrequency = serializers.FloatField()
    endFrequency = serializers.FloatField()


class AnnotationTaskResultSerializer(serializers.ModelSerializer):
    annotation = serializers.CharField(source='annotation_tag.name')
    startTime = serializers.FloatField(source='start_time', allow_null=True)
    endTime = serializers.FloatField(source='end_time', allow_null=True)
    startFrequency = serializers.FloatField(source='start_frequency', allow_null=True)
    endFrequency = serializers.FloatField(source='end_frequency', allow_null=True)

    class Meta:
        model = AnnotationResult
        fields = ['id', 'annotation', 'startTime', 'endTime', 'startFrequency', 'endFrequency']


class AnnotationTaskSpectroSerializer(serializers.ModelSerializer):
    winsize = serializers.IntegerField(source='window_size')
    urls = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        if 'dataset_file' in kwargs:
            self.dataset_file = kwargs.pop('dataset_file')
        super().__init__(*args, **kwargs)

    class Meta:
        model = SpectroConfig
        fields = ['nfft', 'winsize', 'overlap', 'urls']

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_urls(self, spectro_config):
        root_url = settings.STATIC_URL + self.dataset_file.dataset.dataset_path
        sound_name = self.dataset_file.filepath.split('/')[-1].replace('.wav', '')
        dataset_conf = self.dataset_file.dataset.dataset_conf or ''
        spectro_path = settings.DATASET_SPECTRO_FOLDER / dataset_conf / spectro_config.name
        return [
            urlquote(f'{root_url}/{spectro_path}/{sound_name}/{tile}')
            for tile in spectro_config.zoom_tiles(sound_name)
        ]


class AnnotationTaskRetrieveSerializer(serializers.Serializer):
    campaignId = serializers.IntegerField(source='annotation_campaign_id')
    annotationTags = serializers.SerializerMethodField()
    boundaries = serializers.SerializerMethodField()
    audioUrl = serializers.SerializerMethodField()
    audioRate = serializers.SerializerMethodField()
    spectroUrls = serializers.SerializerMethodField()
    prevAnnotations = serializers.SerializerMethodField()
    annotationScope = serializers.IntegerField(source='annotation_campaign.annotation_scope')

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_annotationTags(self, task):
        return list(task.annotation_campaign.annotation_set.tags.values_list('name', flat=True))

    @extend_schema_field(AnnotationTaskBoundarySerializer)
    def get_boundaries(self, task):
        return {
            'startTime': task.dataset_file.audio_metadatum.start,
            'endTime': task.dataset_file.audio_metadatum.end,
            'startFrequency': 0,
            'endFrequency': task.dataset_file.sample_rate_khz / 2
        }

    @extend_schema_field(serializers.CharField())
    def get_audioUrl(self, task):
        root_url = settings.STATIC_URL + task.dataset_file.dataset.dataset_path
        return f'{root_url}/{task.dataset_file.filepath}'

    @extend_schema_field(serializers.IntegerField())
    def get_audioRate(self, task):
        return task.dataset_file.sample_rate_khz

    @extend_schema_field(AnnotationTaskSpectroSerializer(many=True))
    def get_spectroUrls(self, task):
        spectros_configs = set(task.dataset_file.dataset.spectro_configs.all()) & set(task.annotation_campaign.spectro_configs.all())
        return AnnotationTaskSpectroSerializer(spectros_configs, many=True, dataset_file=task.dataset_file).data

    @extend_schema_field(AnnotationTaskResultSerializer(many=True))
    def get_prevAnnotations(self, task):
        queryset = task.results.prefetch_related('annotation_tag')
        return AnnotationTaskResultSerializer(queryset, many=True).data


class AnnotationTaskUpdateSerializer(serializers.Serializer):
    """This serializer is responsible for updating a task with new results from the annotator"""

    annotations = AnnotationTaskResultSerializer(many=True)
    task_start_time = serializers.IntegerField()
    task_end_time = serializers.IntegerField()

    def validate_annotations(self, annotations):
        """Validates that annotations correspond to annotation set tags"""
        set_tags = set(self.instance.annotation_campaign.annotation_set.tags.values_list('name', flat=True))
        update_tags = set(ann['annotation_tag']['name'] for ann in annotations)
        unknown_tags = update_tags - set_tags
        if unknown_tags:
            raise serializers.ValidationError(f"{unknown_tags} not valid tags from annotation set {set_tags}.")
        return annotations

    def update(self, task, validated_data):
        task.results.all().delete()
        tags = dict(map(reversed, task.annotation_campaign.annotation_set.tags.values_list('id', 'name')))
        for annotation in validated_data['annotations']:
            annotation['annotation_tag_id'] = tags[annotation.pop('annotation_tag')['name']]
            task.results.create(**annotation)
        task.sessions.create(
            start=datetime.fromtimestamp(validated_data['task_start_time']),
            end=datetime.fromtimestamp(validated_data['task_end_time']),
            session_output=validated_data
        )
        task.status = 2
        task.save()
        return task


class AnnotationTaskUpdateOutputCampaignSerializer(serializers.Serializer):
    next_task = serializers.IntegerField(allow_null=True)
    campaign_id = serializers.IntegerField(allow_null=True)