from datetime import datetime

from django.http import Http404, HttpResponse
from django.utils.http import urlquote
from django.shortcuts import get_object_or_404

from django.utils.dateparse import parse_datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from django.db import transaction
from django.db.models import Count, F
from backend.api.models import Dataset, AnnotationSet, AnnotationCampaign, AnnotationTask, AnnotationResult, DatasetType, AudioMetadatum, GeoMetadatum
from django.contrib.auth.models import User

from backend.settings import STATIC_URL

from backend.api.views.dataset import DatasetViewSet
from backend.api.views.annotation_campaign import AnnotationCampaignViewSet

@api_view(http_method_names=['GET'])
def user_index(request):
    return Response([{"id": user.id, "email": user.email} for user in User.objects.all()])

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
        'annotation_campaign__spectro_configs',
        'annotation_campaign__annotation_set',
        'dataset_file__audio_metadatum',
        'dataset_file__dataset',
        'dataset_file__dataset__spectro_configs',
        'dataset_file__dataset__audio_metadatum'
    ).get(id=task_id)
    df_sample_rate = task.dataset_file.audio_metadatum.sample_rate_khz
    ds_sample_rate = task.dataset_file.dataset.audio_metadatum.sample_rate_khz
    sample_rate = df_sample_rate if df_sample_rate else ds_sample_rate
    root_url = STATIC_URL + task.dataset_file.dataset.dataset_path
    spectros_configs = set(task.dataset_file.dataset.spectro_configs.all()) & set(task.annotation_campaign.spectro_configs.all())
    # We should probably use filename for sound_name but this allows to simplify seeding
    sound_name = task.dataset_file.filepath.split('/')[-1].replace('.wav', '')
    spectro_urls = [{
        'nfft': spectro_config.nfft,
        'winsize': spectro_config.window_size,
        'overlap': spectro_config.overlap,
        'urls': [
            urlquote(f'{root_url}/spectrograms/{spectro_config.name}/{sound_name}/{tile}')
        for tile in spectro_config.zoom_tiles(sound_name)]
    } for spectro_config in spectros_configs]
    prev_annotations = task.results.values(
        'id',
        annotation=F('annotation_tag__name'),
        startTime=F('start_time'),
        endTime=F('end_time'),
        startFrequency=F('start_frequency'),
        endFrequency=F('end_frequency')
    )
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
            'audioUrl': f'{root_url}/{task.dataset_file.filepath}',
            'audioRate': sample_rate,
            'spectroUrls': spectro_urls,
            'prevAnnotations': prev_annotations
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

@api_view(http_method_names=['GET'])
def is_staff(request):
    return Response({'is_staff': request.user.is_staff})
