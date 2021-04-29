from django.http import Http404, HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from django.db.models import Count
from backend.api.models import Dataset, AnnotationSet, AnnotationCampaign
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
        print(request.user.id, request.user.email)
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
def annotation_campaign_report_show(request, id):
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
    return Response([{
        "id": 42,
        "status": 42,
        "filename": "string",
        "dataset_name": "string",
        "start": "string",
        "end": "string"
    }])

@api_view(http_method_names=['GET'])
def annotation_task_show(request, id):
    pass

@api_view(http_method_names=['POST'])
def annotation_task_update(request, id):
    pass
