"""Dataset DRF-Viewset file"""
import csv

from django.conf import settings
from django.db.models import Count, OuterRef, Subquery
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from sentry_sdk import capture_exception

from backend.api.actions import datawork_import
from backend.api.actions.check_new_spectro_config_errors import (
    check_new_spectro_config_errors,
)
from backend.api.models import Dataset
from backend.api.serializers import DatasetSerializer
from backend.utils.filters import ModelFilter


class DatasetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for dataset-related actions
    """

    serializer_class = DatasetSerializer
    queryset = (
        Dataset.objects.select_related(
            "dataset_type",
        )
        .prefetch_related(
            "spectro_configs",
            "related_channel_configuration",
            "related_channel_configuration__deployment",
            "related_channel_configuration__deployment__platform",
            "related_channel_configuration__deployment__platform__type",
            "related_channel_configuration__deployment__project",
            "related_channel_configuration__deployment__project__responsible_parties",
            "related_channel_configuration__deployment__provider",
            "related_channel_configuration__deployment__campaign",
            "related_channel_configuration__deployment__site",
            "related_channel_configuration__hydrophone",
            "related_channel_configuration__hydrophone__model",
            "related_channel_configuration__hydrophone__model__provider",
            "related_channel_configuration__recorder",
            "related_channel_configuration__recorder__model",
            "related_channel_configuration__recorder__model__provider",
            "related_channel_configuration__recording_format",
        )
        .annotate(files_count=Count("files"))
        .order_by("name")
    )
    filter_backends = (ModelFilter,)

    @action(detail=False)
    def list_to_import(self, request):
        """list dataset in datasets.csv"""
        dataset_names = Dataset.objects.values_list("name", flat=True)
        new_datasets = []

        # Check for new datasets
        try:
            with open(
                settings.DATASET_IMPORT_FOLDER / settings.DATASET_FILE, encoding="utf-8"
            ) as csvfile:
                dataset: dict
                for dataset in csv.DictReader(csvfile):
                    dataset["name"] = dataset["dataset"]
                    if dataset["name"] not in dataset_names:
                        new_datasets.append(dataset)
        except FileNotFoundError as error:
            capture_exception(error)
            return HttpResponse(error, status=400)

        if not new_datasets:
            return HttpResponseBadRequest(
                "No new data : Add new data in datasets.csv", status=400
            )

        new_datasets.sort(key=lambda x: x["name"].lower())

        return Response(new_datasets)

    @action(detail=False, methods=["POST"])
    def datawork_import(self, request):
        """Import new datasets from datawork"""
        if not request.user.is_staff:
            return HttpResponse("Forbidden", status=403)

        try:
            new_datasets = datawork_import(
                wanted_datasets=request.data["wanted_datasets"],
                importer=request.user,
            )
        except KeyError as error:
            print("[datawork_import] > KeyError")
            capture_exception(error)
            return HttpResponse(
                f"One of the import CSV is missing the following column : {error}",
                status=400,
            )
        except (FileNotFoundError, PermissionError, ValueError) as error:
            print("[datawork_import] > ValueError")
            capture_exception(error)
            return HttpResponse(error, status=400)

        queryset = new_datasets.annotate(
            files_count=Count("files"),
            type=Subquery(
                new_datasets.filter(pk=OuterRef("pk")).values("dataset_type__name")[:1]
            ),
        )
        serializer = self.serializer_class(queryset, many=True)

        errors = check_new_spectro_config_errors()
        if errors:
            return JsonResponse(errors, status=400)

        return Response(serializer.data)
