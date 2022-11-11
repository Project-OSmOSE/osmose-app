"""Dataset DRF-Viewset file"""
from ast import Try
from cmath import log
import csv

from django.db.models import Count
from django.http import HttpResponse
from django.contrib import messages
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse

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
        stack_message = messages.get_messages(request)
        flash_messages = []
        for message in stack_message:
            flash_messages.append({"message": message.message, "tags": message.tags})
        resultat = {
            "flash_messages": flash_messages,
            "result": serializer.data,
        }
        return Response(resultat)

    @action(detail=False)
    def list_to_import(self, request):
        dataset_names = Dataset.objects.values_list("name", flat=True)
        csv_dataset_names = []
        new_datasets = []

        # Check for new datasets
        try:
            with open(
                settings.DATASET_IMPORT_FOLDER / "datasets.csv", encoding="utf-8"
            ) as csvfile:
                for dataset in csv.DictReader(csvfile):
                    csv_dataset_names.append(dataset["name"])
                    if dataset["name"] not in dataset_names:
                        new_datasets.append(dataset)
        except FileNotFoundError as error:
            capture_exception(error)
            print(f"Error")
            messages.add_message(request, messages.ERROR, f"File Not Found : {error}")
            return redirect(reverse("dataset-list"))

        return Response(new_datasets)

    @action(detail=False, methods=["POST"])
    def datawork_import(self, request):
        """Import new datasets from datawork"""
        if not request.user.is_staff:
            return HttpResponse("Unauthorized", status=403)

        try:
            new_datasets = datawork_import(
                dataset_checked=request.data["dataset_checked"],
                importer=request.user,
            )
        except FileNotFoundError as error:
            capture_exception(error)
            messages.add_message(request, messages.ERROR, f"File Not Found : {error}")
            return redirect(reverse("dataset-list"))
        except PermissionError as error:
            capture_exception(error)
            messages.add_message(request, messages.ERROR, f"Permission : {error}")
            return redirect(reverse("dataset-list"))
        except KeyError as error:
            capture_exception(error)
            messages.add_message(
                request,
                messages.ERROR,
                f"One of the import CSV is missing the following column : {error}",
            )
            return redirect(reverse("dataset-list"))

        queryset = new_datasets.annotate(Count("files")).select_related("dataset_type")
        serializer = self.serializer_class(queryset, many=True)
        resultat = {
            "flash_messages": [],
            "result": serializer.data,
        }
        return Response(resultat)
