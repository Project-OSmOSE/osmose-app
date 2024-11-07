"""Annotation result viewset"""
import ast
import csv
from io import StringIO

# pylint: disable=duplicate-code
from pathlib import Path
from typing import Optional

from django.db.models import QuerySet, Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, filters, status, mixins
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationResult,
    AnnotationCampaign,
    DatasetFile,
)
from backend.api.serializers import (
    AnnotationResultSerializer,
    AnnotationResultImportListSerializer,
)
from backend.utils.filters import ModelFilter, get_boolean_query_param
from backend.utils.serializers import FileUploadSerializer


class ResultAccessFilter(filters.BaseFilterBackend):
    """Filter result access base on user"""

    def filter_queryset(
        self, request: Request, queryset: QuerySet[AnnotationResult], view
    ):
        if request.user.is_staff:
            return queryset
        return queryset.filter(
            Q(annotation_campaign__owner=request.user)
            | (
                Q(annotation_campaign__archive__isnull=True)
                & (Q(annotator=request.user) | Q(annotator__isnull=True))
            )
        )


class AnnotationResultViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    A simple ViewSet for annotation result related actions
    """

    queryset = AnnotationResult.objects.select_related(
        "label",
        "confidence_indicator",
        "detector_configuration",
        "detector_configuration__detector",
    ).prefetch_related(
        "comments",
        "validations",
    )
    serializer_class = AnnotationResultSerializer
    filter_backends = (ModelFilter, ResultAccessFilter)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset: QuerySet[AnnotationResult] = super().get_queryset()
        for_current_user = get_boolean_query_param(self.request, "for_current_user")
        if self.action in ["list", "retrieve"] and for_current_user:
            queryset = queryset.filter(
                Q(annotator_id=self.request.user.id) | Q(annotator__isnull=True)
            )
        return queryset

    @action(
        methods=["POST"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)/file/(?P<file_id>[^/.]+)",
        url_name="campaign-file",
    )
    def bulk_post(self, request, campaign_id, file_id):
        """Bulk post results for annotator"""
        # Check permission
        campaign = get_object_or_404(AnnotationCampaign, id=campaign_id)
        file = get_object_or_404(DatasetFile, id=file_id)
        file_ranges = campaign.annotation_file_ranges.filter(
            annotator_id=request.user.id
        )
        if not file_ranges.exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
        all_files = []
        for file_range in file_ranges:
            all_files += list(file_range.get_files())
        if file not in all_files:
            return Response(status=status.HTTP_403_FORBIDDEN)

        data = [
            {
                **d,
                "annotation_campaign": campaign_id,
                "dataset_file": file_id,
                "annotator": request.user.id,
                "comments": [
                    {
                        **c,
                        "annotation_campaign": campaign_id,
                        "dataset_file": file_id,
                        "author": c["author"]
                        if "author" in c and c["author"] is not None
                        else request.user.id,
                    }
                    for c in (d["comments"] if "comments" in d else [])
                ],
                "validations": [
                    {
                        **v,
                        "annotator": v["annotator"]
                        if "annotator" in v and v["annotator"] is not None
                        else request.user.id,
                    }
                    for v in (d["validations"] if "validations" in d else [])
                ],
            }
            for d in request.data
        ]

        initial_results = self.get_queryset().filter(
            annotation_campaign_id=campaign_id,
            dataset_file_id=file_id,
            annotator_id=request.user.id,
        )
        serializer = self.get_serializer_class()(
            initial_results,
            many=True,
            data=data,
            context={"campaign": campaign, "file": file},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        methods=["POST"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)/import",
        url_name="campaign-import",
    )
    def import_results(self, request, campaign_id):
        """Import result from automated detection"""
        # Check permission
        campaign = get_object_or_404(AnnotationCampaign, id=campaign_id)
        if campaign.owner_id != request.user.id and not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)

        upload_serializer = FileUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)

        file = upload_serializer.validated_data["file"]

        force = get_boolean_query_param(self.request, "force")

        dataset_name = request.query_params.get("dataset_name")
        detectors_map = ast.literal_eval(request.query_params.get("detectors_map"))

        decoded_file = file.read().decode()
        io_string = StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        data = []
        for row in reader:
            annotator = row["annotator"] if "annotator" in row else None
            if annotator not in detectors_map:
                continue
            detector_map = detectors_map[annotator] if annotator else None
            confidence_level = (
                row["confidence_indicator_level"]
                if "confidence_indicator_level" in row
                else None
            )
            detector = annotator
            if detector_map and "detector" in detector_map and detector_map["detector"]:
                detector = detector_map["detector"]
            data.append(
                {
                    "is_box": row["is_box"],
                    "dataset": dataset_name,
                    "detector": detector,
                    "detector_config": detector_map["configuration"]
                    if detector_map and "configuration" in detector_map
                    else None,
                    "start_datetime": row["start_datetime"],
                    "end_datetime": row["end_datetime"],
                    "min_frequency": row["start_frequency"],
                    "max_frequency": row["end_frequency"],
                    "label": row["annotation"],
                    "confidence_indicator": {
                        "label": row["confidence_indicator_label"],
                        "level": confidence_level.split("/")[0],
                    }
                    if "confidence_indicator_label" in row
                    and row["confidence_indicator_label"]
                    and confidence_level
                    else None,
                    "annotation_campaign": campaign_id,
                }
            )

        # Execute import
        serializer = AnnotationResultImportListSerializer(
            data=data,
            context={
                "campaign": campaign,
                "force": force,
            },
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        list_serializer = self.get_serializer_class()(serializer.instance, many=True)
        return Response(list_serializer.data, status=status.HTTP_201_CREATED)
