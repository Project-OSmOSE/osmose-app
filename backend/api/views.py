from datetime import datetime

from django.http import Http404, HttpResponse
from django.utils.http import urlquote
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from django.db.models import Count
from backend.api.models import Dataset, AnnotationSet, AnnotationCampaign, AnnotationTask
from django.contrib.auth.models import User

@api_view(http_method_names=['GET'])
def dataset_index(request):
    datasets = Dataset.objects.annotate(Count('files')).select_related('dataset_type')
    return Response([{
        'id': dataset.id,
        'name': dataset.name,
        'files_type': dataset.files_type,
        'start_date': dataset.start_date,
        'end_date': dataset.end_date,
        'files_count': dataset.files__count,
        'type': dataset.dataset_type.name
    } for dataset in datasets])

@api_view(http_method_names=['GET'])
def user_index(request):
    return Response([{"id": user.id, "email": user.email} for user in User.objects.all()])

@api_view(http_method_names=['GET'])
def annotation_campaign_show(request, campaign_id):
    campaign = AnnotationCampaign.objects.get(id=campaign_id)
    user_tasks = campaign.tasks.filter(annotator_id=request.user.id)
    return Response({
        'campaign': {
            'id': campaign.id,
            'name': campaign.name,
            'desc': campaign.desc,
            'instructionsUrl': campaign.instructions_url,
            'start': campaign.start,
            'end': campaign.end,
            'annotation_set_id': campaign.annotation_set_id,
            'owner_id': campaign.owner_id,
        },
        'tasks': [res for res in campaign.tasks.values('status', 'annotator_id').annotate(count=Count('status'))]
    })

@api_view(http_method_names=['GET', 'POST'])
def annotation_campaign_index_create(request):
    if request.POST:
        return Response({
            "id": 42,
            "name": "string",
            "start": "string",
            "end": "string",
            "annotation_set_id": 42,
            "owner_id": 42,
            "datasets": [
                {
                "id": 42
                }
            ],
            "annotation_tasks": [
                {
                "id": 42,
                "status": 42,
                "dataset_file_id": 42,
                "annotator_id": 42,
                "annotation_campaign_id": 42
                }
            ]
        })
    else:
        campaigns = AnnotationCampaign.objects.annotate(Count('datasets')).prefetch_related('tasks')
        return Response([{
            'id': campaign.id,
            'name': campaign.name,
            'instructionsUrl': campaign.instructions_url,
            'start': campaign.start,
            'end': campaign.end,
            'annotation_set_id': campaign.annotation_set_id,
            'tasks_count': campaign.tasks.count(),
            'user_tasks_count': campaign.tasks.filter(annotator_id=request.user.id).count(),
            'complete_tasks_count': campaign.tasks.filter(status=2).count(),
            'user_complete_tasks_count': campaign.tasks.filter(annotator_id=request.user.id, status=2).count(),
            'datasets_count': campaign.datasets__count
        } for campaign in campaigns])

@api_view(http_method_names=['GET'])
def annotation_campaign_report_show(request, campaign_id):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="export.csv"'
    response.write('csv,file')
    return response

@api_view(http_method_names=['GET'])
def annotation_set_index(request):
    annotation_sets = AnnotationSet.objects.all()
    return Response([{
        'id': annotation_set.id,
        'name': annotation_set.name,
        'desc': annotation_set.desc,
        'tags': list(annotation_set.tags.values_list('name', flat=True))
    } for annotation_set in annotation_sets])

@api_view(http_method_names=['GET'])
def annotation_task_index(request, campaign_id):
    tasks = AnnotationTask.objects.filter(
        annotator_id=request.user.id,
        annotation_campaign_id=campaign_id
    ).prefetch_related('dataset_file', 'dataset_file__dataset', 'dataset_file__audio_metadatum')
    return Response([{
        'id': task.id,
        'status': task.status,
        'filename': task.dataset_file.filename,
        'dataset_name': task.dataset_file.dataset.name,
        'start': task.dataset_file.audio_metadatum.start,
        'end': task.dataset_file.audio_metadatum.end
    } for task in tasks])

@api_view(http_method_names=['GET'])
def annotation_task_show(request, task_id):
    task = AnnotationTask.objects.prefetch_related(
        'annotation_campaign',
        'annotation_campaign__annotation_set',
        'dataset_file__audio_metadatum',
        'dataset_file__dataset__audio_metadatum'
    ).get(id=task_id)
    df_sample_rate = task.dataset_file.audio_metadatum.sample_rate_khz
    ds_sample_rate = task.dataset_file.dataset.audio_metadatum.sample_rate_khz
    sample_rate = df_sample_rate if df_sample_rate else ds_sample_rate
    spectros = ['50h_0_1_0.png', '50h_0_2_0.png', '50h_0_2_1.png', '50h_0_4_0.png', '50h_0_4_1.png', '50h_0_4_2.png',
    '50h_0_4_3.png', '50h_0_8_0.png', '50h_0_8_1.png', '50h_0_8_2.png', '50h_0_8_3.png', '50h_0_8_4.png', '50h_0_8_5.png',
    '50h_0_8_6.png', '50h_0_8_7.png']
    spectro_urls = [{
        'nfft': 4096,
        'winsize': 2000,
        'overlap': 90,
        'urls': [urlquote(f'/static/nfft=4096 winsize=2000 overlap=90/{spectro}') for spectro in spectros]
    }]
    return Response({
        'task': {
            'campaignId': task.annotation_campaign_id,
            'annotationTags': list(task.annotation_campaign.annotation_set.tags.values_list('name', flat=True)),
            'boundaries': {
                'startTime': task.dataset_file.audio_metadatum.start,
                'endTime': task.dataset_file.audio_metadatum.end,
                'startFrequency': 0,
                'endFrequency': sample_rate / 2
            },
            'audioUrl': '/static/50h_0.wav',
            'audioRate': sample_rate,
            'spectroUrls': spectro_urls,
            'prevAnnotations': []
    }})

@api_view(http_method_names=['POST'])
def annotation_task_update(request, task_id):
    task = get_object_or_404(AnnotationTask, pk=task_id)
    if task.annotator_id != request.user.id:
        raise Http404()
    tags = dict(map(reversed, task.annotation_campaign.annotation_set.tags.values_list('id', 'name')))
    for annotation in request.data['annotations']:
        task.results.create(
            start_time=annotation.get('startTime'),
            end_time=annotation.get('endTime'),
            start_frequency=annotation.get('start_frequency'),
            end_frequency=annotation.get('end_frequency'),
            annotation_tag_id=tags[annotation['annotation']]
        )
    task.sessions.create(
        start=datetime.fromtimestamp(request.data['task_start_time']),
        end=datetime.fromtimestamp(request.data['task_end_time']),
        session_output=request.data
    )
    task.status = 2
    task.save()
    next_task = AnnotationTask.objects.filter(
        annotator_id=request.user.id,
        annotation_campaign_id=task.annotation_campaign_id
    ).exclude(status=2).order_by('dataset_file__audio_metadatum__start').first()
    if next_task is None:
        return Response({'next_task': None, 'campaign_id': task.annotation_campaign_id})
    return Response({'next_task': next_task.id})
