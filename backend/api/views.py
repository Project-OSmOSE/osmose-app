from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

@api_view(http_method_names=['GET'])
def dataset_index(request):
    return Response([{
        'id': 5,
        'name': 'test',
        'files_type': 'wav',
        'start_date': '22/421/242242',
        'end_date': '22/421/24221',
        'files_count': 1337,
        'type': 'top'
    }])

@api_view(http_method_names=['GET'])
def user_index(request):
    return Response([{"id": 42, "email": "string"}])

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
    return Response([{
        "id": 42,
        "name": "string",
        "desc": "string",
        "tags": [
          "string"
        ]
    }])

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
