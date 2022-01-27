"""Dataset DRF-Viewset file"""

from django.db.models import Count
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from sentry_sdk import capture_exception

from backend.api.models import Dataset
from backend.api.actions import datawork_import
from backend.api.serializers import DatasetSerializer


class DatasetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for dataset-related actions
    """

    serializer_class = DatasetSerializer

    def list(self, request):
        """List available datasets"""
        queryset = Dataset.objects.annotate(Count("files")).select_related(
            "dataset_type"
        )
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def datawork_import(self, request):
        """Import new datasets from datawork"""
        if not request.user.is_staff:
            return HttpResponse("Unauthorized", status=403)

        try:
            new_datasets = datawork_import(importer=request.user)
        except FileNotFoundError as error:
            capture_exception(error)
            return HttpResponse(error, status=400)
        except PermissionError as error:
            capture_exception(error)
            return HttpResponse(error, status=400)
        except KeyError as error:
            capture_exception(error)
            return HttpResponse(
                f"One of the import CSV is missing the following column : {error}",
                status=400,
            )

        queryset = new_datasets.annotate(Count("files")).select_related("dataset_type")
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
