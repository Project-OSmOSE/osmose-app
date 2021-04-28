from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from django.db.models import Count
from backend.api.models import Dataset, AnnotationSet
from django.contrib.auth.models import User

@api_view(http_method_names=['GET'])
def dataset_index(request):
    datasets = Dataset.objects.annotate(Count('dataset_files')).select_related('dataset_type')
    return Response([{
        'id': dataset.id,
        'name': dataset.name,
        'files_type': dataset.files_type,
        'start_date': dataset.start_date,
        'end_date': dataset.end_date,
        'files_count': dataset.dataset_files__count,
        'type': dataset.dataset_type.name
    } for dataset in datasets])

@api_view(http_method_names=['GET'])
def user_index(request):
    return Response([{"id": user.id, "email": user.email} for user in User.objects.all()])

@api_view(http_method_names=['GET'])
def annotation_campaign_show(request, id):
    return Response({
        "campaign": {
            "id": 5,
            "name": "string",
            "instructionsUrl": "string",
            "start": "string",
            "end": "string",
            "annotation_set_id": 42,
            "tasks_count": 42,
            "user_tasks_count": 42,
            "complete_tasks_count": 42,
            "user_complete_tasks_count": 42,
            "datasets_count": 42
        },
        "tasks": [
            {
                "count": 42,
                "annotator_id": 42,
                "status": 42
            }
        ]
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
        return Response([{
            "id": 5,
            "name": "string",
            "instructionsUrl": "string",
            "start": "string",
            "end": "string",
            "annotation_set_id": 42,
            "tasks_count": 42,
            "user_tasks_count": 42,
            "complete_tasks_count": 42,
            "user_complete_tasks_count": 42,
            "datasets_count": 42
        }])

@api_view(http_method_names=['GET'])
def annotation_campaign_report_show(request, id):
    return Response('csv,file')

@api_view(http_method_names=['GET'])
def annotation_set_index(request):
    annotation_sets = AnnotationSet.objects.all()
    return Response([{
        "id": annotation_set.id,
        "name": annotation_set.name,
        "desc": annotation_set.desc,
        "tags": list(annotation_set.tags.values_list('name', flat=True))
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
