"""Annotation result viewset"""
import ast
import csv
from io import StringIO

from backend.api.serializers import (
    AnnotationResultSerializer,
    AnnotationResultImportListSerializer,
)
from django.db.models import QuerySet, Q, Prefetch, F, Subquery, OuterRef
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, filters, status, mixins
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationResult,
    DatasetFile,
    AnnotationTask,
    AnnotationResultValidation,
    AnnotationCampaignPhase,
    Phase,
)
from backend.utils.filters import ModelFilter, get_boolean_query_param


# pylint: disable=duplicate-code


class ResultAccessFilter(filters.BaseFilterBackend):
    """Filter result access base on user"""

    def filter_queryset(
        self, request: Request, queryset: QuerySet[AnnotationResult], view
    ):
        if request.user.is_staff_or_superuser:
            return queryset

        is_campaign_owner = Q(
            annotation_campaign_phase__annotation_campaign__owner=request.user
        )
        campaign_isn_t_archived = Q(
            annotation_campaign_phase__annotation_campaign__archive__isnull=True
        )
        is_annotator_on_campaign_on_this_file = Q(  # Whatever the phase type is
            annotation_campaign_phase__annotation_campaign__phases__file_ranges__annotator=request.user,
            annotation_campaign_phase__annotation_campaign__phases__file_ranges__from_datetime__gte=F(
                "dataset_file__start"
            ),
            annotation_campaign_phase__annotation_campaign__phases__file_ranges__to_datetime__lte=F(
                "dataset_file__end"
            ),
        )
        return queryset.filter(
            is_campaign_owner
            | (campaign_isn_t_archived & is_annotator_on_campaign_on_this_file)
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
    )
    serializer_class = AnnotationResultSerializer
    filter_backends = (ModelFilter, ResultAccessFilter)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset: QuerySet[AnnotationResult] = (
            super().get_queryset().filter(is_update_of__isnull=True)
        )
        for_current_user = get_boolean_query_param(self.request, "for_current_user")
        if self.action in ["list", "retrieve"]:
            if self.request.query_params.get("for_phase"):
                phase: AnnotationCampaignPhase = get_object_or_404(
                    AnnotationCampaignPhase,
                    id=self.request.query_params.get("for_phase"),
                )
                if phase.phase == Phase.ANNOTATION:
                    queryset = queryset.filter(annotation_campaign_phase=phase)
                    if for_current_user:
                        queryset = queryset.filter(annotator=self.request.user)
                elif phase.phase == Phase.VERIFICATION:
                    queryset = queryset.filter(
                        annotation_campaign_phase__annotation_campaign=phase.annotation_campaign
                    )
                    if for_current_user:
                        queryset = queryset.filter(
                            Q(
                                annotator=self.request.user,
                                annotation_campaign_phase__phase=Phase.VERIFICATION,
                            )
                            | (
                                ~Q(annotator=self.request.user)
                                & Q(annotation_campaign_phase__phase=Phase.ANNOTATION)
                            )
                        )
            if for_current_user:
                annotator_results = queryset.filter(annotator=self.request.user)

                user_verification_phases = AnnotationCampaignPhase.objects.filter(
                    file_ranges__annotator=self.request.user,
                    phase=Phase.VERIFICATION,
                )
                results_for_verification = queryset.filter(
                    annotation_campaign_phase_id__in=Subquery(
                        user_verification_phases.filter(
                            file_ranges__from_datetime__lte=OuterRef(
                                "dataset_file__start"
                            ),
                            file_ranges__to_datetime__gte=OuterRef("dataset_file__end"),
                        ).values_list("id", flat=True)
                    )
                )

                queryset = annotator_results | results_for_verification
                queryset = queryset.prefetch_related(
                    Prefetch(
                        "validations",
                        queryset=AnnotationResultValidation.objects.filter(
                            annotator_id=self.request.user.id
                        ),
                    ),
                    Prefetch(
                        "updated_to",
                        queryset=AnnotationResult.objects.filter(
                            annotator_id=self.request.user.id
                        ),
                    ),
                )
        else:
            queryset = queryset.prefetch_related("validations", "updated_to")
        return queryset

    @staticmethod
    def map_request_results(results: list[dict], phase_id, file_id, user_id):
        """Map results from request with the other request information"""
        return [
            {
                **r,
                "dataset_file": file_id,
                "comments": [
                    {
                        **c,
                        "annotation_campaign_phase": phase_id,
                        "dataset_file": file_id,
                        "author": c["author"]
                        if "author" in c and c["author"] is not None
                        else user_id,
                    }
                    for c in (r["comments"] if "comments" in r else [])
                ],
                "validations": [
                    {
                        **v,
                        "annotator": v["annotator"]
                        if "annotator" in v and v["annotator"] is not None
                        else user_id,
                    }
                    for v in (r["validations"] if "validations" in r else [])
                    if "annotator" in r and r["annotator"] != user_id
                ],
            }
            for r in results
        ]

    @staticmethod
    def update_results(
        new_results: list[dict],
        phase: AnnotationCampaignPhase,
        file: DatasetFile,
        user_id,
    ):
        """Update with given results"""
        data = AnnotationResultViewSet.map_request_results(
            new_results, phase.id, file.id, user_id
        )
        current_results = AnnotationResultViewSet.queryset.filter(
            dataset_file_id=file.id,
        )
        if phase.phase == Phase.ANNOTATION:
            current_results = current_results.filter(
                annotation_campaign_phase_id=phase.id,
                annotator_id=user_id,
            )
        else:
            current_results = current_results.filter(
                Q(
                    annotation_campaign_phase_id=phase.id,
                    annotator_id=user_id,
                )
                | (
                    ~Q(annotation_campaign_phase_id=phase.id, annotator_id=user_id)
                    & Q(
                        annotation_campaign_phase__annotation_campaign=phase.annotation_campaign
                    )
                )
            )
        serializer = AnnotationResultViewSet.serializer_class(
            current_results,
            many=True,
            data=data,
            context={"phase": phase, "file": file},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer.data

    @action(
        methods=["POST"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)/phase/(?P<phase_id>[^/.]+)/import",
        url_name="campaign-import",
    )
    def import_results(self, request, campaign_id, phase_id):
        """Import result from automated detection"""
        # Check permission
        phase = get_object_or_404(
            AnnotationCampaignPhase, id=phase_id, annotation_campaign_id=campaign_id
        )
        if (
            phase.annotation_campaign.owner_id != request.user.id
            and not request.user.is_staff_or_superuser
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)

        if phase.phase != Phase.ANNOTATION:
            return Response(
                "Import should always be made on annotation campaign",
                status=status.HTTP_400_BAD_REQUEST,
            )

        dataset_name = request.query_params.get("dataset_name")
        detectors_map = ast.literal_eval(request.query_params.get("detectors_map"))

        reader = csv.DictReader(StringIO(request.data.get("data")))
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
                    "max_frequency": row["end_frequency"]
                    if row["end_frequency"] != ""
                    else None,
                    "label": row["annotation"],
                    "confidence_indicator": {
                        "label": row["confidence_indicator_label"],
                        "level": confidence_level.split("/")[0],
                    }
                    if "confidence_indicator_label" in row
                    and row["confidence_indicator_label"]
                    and confidence_level
                    else None,
                    "annotation_campaig_phase": phase_id,
                }
            )

        # Execute import
        serializer = AnnotationResultImportListSerializer(
            data=data,
            context={
                "phase": phase,
                "force_datetime": get_boolean_query_param(
                    self.request, "force_datetime"
                ),
                "force_max_frequency": get_boolean_query_param(
                    self.request, "force_max_frequency"
                ),
            },
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instances: list[AnnotationResult] = serializer.instance
        AnnotationTask.objects.filter(
            annotation_campaign_phase__annotation_campaign=phase.annotation_campaign,
            annotation_campaign_phase__phase=Phase.VERIFICATION,
            dataset_file_id__in=[r.dataset_file_id for r in instances],
        ).update(status=AnnotationTask.Status.CREATED)
        list_serializer: AnnotationResultSerializer = self.get_serializer_class()(
            instances, many=True
        )
        return Response(list_serializer.data, status=status.HTTP_201_CREATED)
