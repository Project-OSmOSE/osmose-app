"""Annotation campaign DRF-Viewset file"""

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Count
from django.contrib.auth.models import User

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.decorators import action, renderer_classes

from drf_spectacular.utils import extend_schema, extend_schema_field, inline_serializer, OpenApiExample

from backend.utils.renderers import CSVRenderer
from backend.utils.validators import valid_model_ids
from backend.api.models import AnnotationCampaign, AnnotationResult, Dataset, AnnotationSet, SpectroConfig

class AnnotationCampaignListSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()
    user_tasks_count = serializers.SerializerMethodField()
    complete_tasks_count = serializers.SerializerMethodField()
    user_complete_tasks_count = serializers.SerializerMethodField()
    datasets_count = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        if 'user_id' in kwargs:
            self.user_id = kwargs.pop('user_id')
        super().__init__(*args, **kwargs)

    class Meta:
        model = AnnotationCampaign
        fields = [
            'id',
            'name',
            'desc',
            'instructions_url',
            'start',
            'end',
            'annotation_set_id',
            'tasks_count',
            'user_tasks_count',
            'complete_tasks_count',
            'user_complete_tasks_count',
            'datasets_count'
        ]

    @extend_schema_field(serializers.IntegerField)
    def get_tasks_count(self, campaign):
        return campaign.tasks.count()

    @extend_schema_field(serializers.IntegerField)
    def get_user_tasks_count(self, campaign):
        return campaign.tasks.filter(annotator_id=self.user_id).count()

    @extend_schema_field(serializers.IntegerField)
    def get_complete_tasks_count(self, campaign):
        return campaign.tasks.filter(status=2).count()

    @extend_schema_field(serializers.IntegerField)
    def get_user_complete_tasks_count(self, campaign):
        return campaign.tasks.filter(annotator_id=self.user_id, status=2).count()

    @extend_schema_field(serializers.IntegerField)
    def get_datasets_count(self, campaign):
        return campaign.datasets__count

class AnnotationCampaignRetrieveAuxCampaignSerializer(serializers.ModelSerializer):
    annotation_set_id = serializers.IntegerField()

    class Meta:
        model = AnnotationCampaign
        fields = ['id', 'name', 'desc', 'instructions_url', 'start', 'end', 'annotation_set_id', 'datasets']


class AnnotationCampaignRetrieveAuxTaskSerializer(serializers.Serializer):
    status = serializers.IntegerField()
    annotator_id = serializers.IntegerField()
    count = serializers.IntegerField()

class AnnotationCampaignRetrieveSerializer(serializers.Serializer):
    campaign = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()

    @extend_schema_field(AnnotationCampaignRetrieveAuxCampaignSerializer)
    def get_campaign(self, campaign):
        return AnnotationCampaignRetrieveAuxCampaignSerializer(campaign).data

    @extend_schema_field(AnnotationCampaignRetrieveAuxTaskSerializer(many=True))
    def get_tasks(self, campaign):
        return list(campaign.tasks.values('status', 'annotator_id').annotate(count=Count('status')))


class AnnotationCampaignCreateSerializer(serializers.ModelSerializer):
    desc = serializers.CharField(allow_blank=True)
    instructions_url = serializers.CharField(allow_blank=True)
    start = serializers.DateTimeField(required=False)
    end = serializers.DateTimeField(required=False)
    annotation_set_id = serializers.IntegerField(validators=[valid_model_ids(AnnotationSet)])
    datasets = serializers.ListField(child=serializers.IntegerField(), validators=[valid_model_ids(Dataset)], allow_empty=False)
    spectros = serializers.ListField(child=serializers.IntegerField(), validators=[valid_model_ids(SpectroConfig)], allow_empty=False)
    annotators = serializers.ListField(child=serializers.IntegerField(), validators=[valid_model_ids(User)])
    annotation_method = serializers.IntegerField(min_value=0, max_value=1)
    annotation_goal = serializers.IntegerField(min_value=1)

    class Meta:
        model = AnnotationCampaign
        fields = [
            'id', 'name', 'desc', 'instructions_url', 'start', 'end', 'annotation_set_id',
            'datasets', 'spectros', 'annotators', 'annotation_method', 'annotation_goal',
            'annotation_scope'
        ]

    def validate(self, data):
        """Validates that chosen spectros correspond to chosen datasets"""
        db_spectros = Dataset.objects.filter(id__in=data['datasets']).values_list('spectro_configs', flat=True)
        bad_vals = set(data['spectros']) - set(db_spectros)
        if bad_vals:
            raise serializers.ValidationError(f"{bad_vals} not valid ids for spectro configs of given datasets")
        return data

    def create(self, validated_data):
        campaign = AnnotationCampaign(
            name=validated_data['name'],
            desc=validated_data.get('desc'),
            start=validated_data.get('start'),
            end=validated_data.get('end'),
            annotation_set_id=validated_data['annotation_set_id'],
            owner_id=validated_data['owner_id'],
            instructions_url=validated_data.get('instructions_url')
        )
        campaign.save()
        campaign.datasets.set(validated_data['datasets'])
        campaign.spectro_configs.set(validated_data['spectros'])
        file_count = sum(campaign.datasets.annotate(Count('files')).values_list('files__count', flat=True))
        total_goal = file_count * int(validated_data['annotation_goal'])
        annotator_goal, remainder = divmod(total_goal, len(validated_data['annotators']))
        annotation_method = ['random', 'sequential'][int(validated_data['annotation_method'])]
        for annotator in User.objects.filter(id__in=validated_data['annotators']):
            files_target = annotator_goal
            if remainder > 0:
                files_target += 1
                remainder -= 1
            campaign.add_annotator(annotator, files_target, annotation_method)
        return campaign

class AnnotationCampaignViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for annotation campaign related actions
    """

    queryset = AnnotationCampaign.objects.all()
    serializer_class = AnnotationCampaignListSerializer

    def list(self, request):
        """List annotation campaigns"""
        queryset = self.queryset.annotate(Count('datasets')).prefetch_related('tasks')
        serializer = self.serializer_class(queryset, many=True, user_id=request.user.id)
        return Response(serializer.data)

    @extend_schema(responses=AnnotationCampaignRetrieveSerializer)
    def retrieve(self, request, pk=None):
        """Show a specific annotation campaign"""
        annotation_campaign = get_object_or_404(self.queryset, pk=pk)
        serializer = AnnotationCampaignRetrieveSerializer(annotation_campaign)
        return Response(serializer.data)

    @transaction.atomic
    @extend_schema(request=AnnotationCampaignCreateSerializer, responses=AnnotationCampaignRetrieveAuxCampaignSerializer)
    def create(self, request):
        create_serializer = AnnotationCampaignCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        campaign = create_serializer.save(owner_id=request.user.id)
        serializer = AnnotationCampaignRetrieveAuxCampaignSerializer(campaign)
        return Response(serializer.data)

    @extend_schema(
        responses={(200, 'text/csv'): str},
        examples=[OpenApiExample(
            'CSV campaign results example',
            value="""dataset,filename,start_time,end_time,start_frequency,end_frequency,annotation,annotator
SPM Aural A,sound000.wav,418.0,572.0,9370.0,11567.0,Boat,Albert
SPM Aural A,sound000.wav,543.0,663.0,6333.0,9119.0,Rain,Albert
SPM Aural A,sound001.wav,30.0,233.0,549.0,3551.0,Odoncetes,Albert
SPM Aural A,sound001.wav,1.0,151.0,5751.0,9341.0,Rain,Albert
SPM Aural B,sound000.wav,284.0,493.0,5794.0,8359.0,Boat,Albert""",
            media_type='text/csv'
        )]
    )
    @action(detail=True, renderer_classes=[CSVRenderer])
    def report(self, request, pk=None):
        """Returns the CSV report for the given campaign"""
        campaign = get_object_or_404(AnnotationCampaign, pk=pk)
        data = ['dataset filename start_time end_time start_frequency end_frequency annotation annotator'.split()]
        results = AnnotationResult.objects.prefetch_related(
            'annotation_task',
            'annotation_task__annotator',
            'annotation_task__dataset_file',
            'annotation_task__dataset_file__dataset',
            'annotation_tag'
        ).filter(annotation_task__annotation_campaign_id=pk)
        for result in results:
            data.append([
                result.annotation_task.dataset_file.dataset.name,
                result.annotation_task.dataset_file.filename,
                str(result.start_time or ''),
                str(result.end_time or ''),
                str(result.start_frequency or ''),
                str(result.end_frequency or ''),
                result.annotation_tag.name,
                result.annotation_task.annotator.username
            ])
        response = Response(data)
        response['Content-Disposition'] = f'attachment; filename="{campaign.name.replace(" ", "_")}.csv"'
        return response
