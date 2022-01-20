"""User DRF-Viewset file"""

from datetime import datetime

from django.shortcuts import get_object_or_404
from django.utils.http import urlquote

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema, extend_schema_field, OpenApiParameter, OpenApiTypes

from backend.api.models import AnnotationCampaign, AnnotationTask, AnnotationResult, SpectroConfig
from backend.settings import STATIC_URL, DATASET_SPECTRO_FOLDER

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
        root_url = STATIC_URL + self.dataset_file.dataset.dataset_path
        sound_name = self.dataset_file.filepath.split('/')[-1].replace('.wav', '')
        dataset_conf = self.dataset_file.dataset.dataset_conf or ''
        spectro_path = DATASET_SPECTRO_FOLDER / dataset_conf / spectro_config.name
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
            'endFrequency': self.get_audioRate(task) / 2
        }

    @extend_schema_field(serializers.CharField())
    def get_audioUrl(self, task):
        root_url = STATIC_URL + task.dataset_file.dataset.dataset_path
        return f'{root_url}/{task.dataset_file.filepath}'

    @extend_schema_field(serializers.IntegerField())
    def get_audioRate(self, task):
        df_sample_rate = task.dataset_file.audio_metadatum.sample_rate_khz
        ds_sample_rate = task.dataset_file.dataset.audio_metadatum.sample_rate_khz
        sample_rate = df_sample_rate if df_sample_rate else ds_sample_rate
        return sample_rate

    @extend_schema_field(AnnotationTaskSpectroSerializer(many=True))
    def get_spectroUrls(self, task):
        spectros_configs = set(task.dataset_file.dataset.spectro_configs.all()) & set(task.annotation_campaign.spectro_configs.all())
        return AnnotationTaskSpectroSerializer(spectros_configs, many=True, dataset_file=task.dataset_file).data

    @extend_schema_field(AnnotationTaskResultSerializer(many=True))
    def get_prevAnnotations(self, task):
        queryset = task.results.prefetch_related('annotation_tag')
        return AnnotationTaskResultSerializer(queryset, many=True).data


class AnnotationTaskUpdateSerializer(serializers.Serializer):
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


class AnnotationTaskViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for annotation tasks related actions
    """

    queryset = AnnotationTask.objects.all().prefetch_related(
        'dataset_file__audio_metadatum'
    ).order_by('dataset_file__audio_metadatum__start')
    serializer_class = AnnotationTaskSerializer

    @extend_schema(
        parameters=[OpenApiParameter('campaign_id', int, OpenApiParameter.PATH)],
        responses=AnnotationTaskSerializer(many=True)
    )
    @action(detail=False, url_path='campaign/(?P<campaign_id>[^/.]+)')
    def campaign_list(self, request, campaign_id):
        """List tasks for given annotation campaign"""
        get_object_or_404(AnnotationCampaign, pk=campaign_id)
        queryset = self.queryset.filter(
            annotator_id=request.user.id,
            annotation_campaign_id=campaign_id
        ).prefetch_related('dataset_file', 'dataset_file__dataset')
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(responses=AnnotationTaskRetrieveSerializer)
    def retrieve(self, request, pk):
        """Retrieve annotation task instructions to the corresponding id"""
        queryset = self.queryset.prefetch_related(
            'annotation_campaign',
            'annotation_campaign__spectro_configs',
            'annotation_campaign__annotation_set',
            'dataset_file__dataset',
            'dataset_file__dataset__spectro_configs',
            'dataset_file__dataset__audio_metadatum'
        )
        task = get_object_or_404(queryset, pk=pk)
        serializer = AnnotationTaskRetrieveSerializer(task)
        return Response(serializer.data)

    @extend_schema(request=AnnotationTaskUpdateSerializer, responses=AnnotationTaskUpdateOutputCampaignSerializer)
    def update(self, request, pk):
        """Update an annotation task with new results"""
        queryset = self.queryset.filter(annotator=request.user.id)
        task = get_object_or_404(queryset, pk=pk)
        update_serializer = AnnotationTaskUpdateSerializer(task, data=request.data)
        update_serializer.is_valid(raise_exception=True)
        task = update_serializer.save()

        task_date = task.dataset_file.audio_metadatum.start
        next_tasks = self.queryset.filter(
            annotator_id=request.user.id,
            annotation_campaign_id=task.annotation_campaign_id
        ).exclude(status=2)
        next_task = next_tasks.filter(dataset_file__audio_metadatum__start__gte=task_date).first()
        if next_task is None:
            next_task = next_tasks.first()
        if next_task is None:
            return Response({'next_task': None, 'campaign_id': task.annotation_campaign_id})
        return Response({'next_task': next_task.id, 'campaign_id': None})
