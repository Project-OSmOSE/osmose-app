"""Viewset for annotation file range"""
from typing import Optional

from django.db.models import (
    QuerySet,
    Q,
    Exists,
    OuterRef,
    Count,
    Value,
    Subquery,
    Func,
    F,
)
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationFileRange,
    AnnotationTask,
    DatasetFile,
    AnnotationCampaignPhase,
    Phase,
    AnnotationResult,
)
from backend.api.serializers import (
    AnnotationFileRangeSerializer,
)
from backend.api.serializers.annotation.file_range import FileRangeDatasetFileSerializer
from backend.utils.filters import ModelFilter, get_boolean_query_param


class AnnotationFileRangeFilesFilter(filters.BaseFilterBackend):
    """Filter dataset files from file ranges"""

    @staticmethod
    def get_results_for_file_range(
        request: Request,
        view,
        file_range,
        user_annotations: Optional[bool],
        user_id: int,
        features: Optional[bool],
    ):
        """Recover matching results"""
        results: QuerySet[AnnotationResult] = ModelFilter().filter_queryset(
            request, file_range.results, view
        )
        if features is not None:
            results = results.filter(acoustic_features__isnull=features)

        if user_annotations is not None:
            file_filter = Q(dataset_file_id=OuterRef("id"))
            if file_range.annotation_campaign_phase.phase == Phase.ANNOTATION:
                file_filter = file_filter & Q(annotator_id=user_id)
            elif file_range.annotation_campaign_phase.phase == Phase.VERIFICATION:
                file_filter = file_filter & ~Q(annotator_id=user_id)
            if user_annotations:
                results = results.filter(file_filter)
            else:
                results = results.filter(~file_filter)

        return results

    def filter_queryset(
        self, request: Request, queryset: QuerySet[AnnotationFileRange], view
    ) -> QuerySet[DatasetFile]:
        """Get filtered dataset files"""
        files = DatasetFile.objects.none()
        for file_range in queryset:
            files = files | self._filter_queryset_for_file_range(
                request, file_range, view
            )

        return files.order_by("start", "id")

    def _filter_queryset_for_file_range(
        self, request: Request, file_range: AnnotationFileRange, view
    ) -> QuerySet[DatasetFile]:
        """Get filtered dataset files for a specific file_range"""
        files = DatasetFile.objects.filter_for_file_range(file_range)
        files: QuerySet[DatasetFile] = ModelFilter().filter_queryset(
            request, files, view
        )

        with_user_annotations = get_boolean_query_param(
            request, "with_user_annotations"
        )
        with_features = get_boolean_query_param(
            request, "annotation_results__acoustic_features__isnull"
        )
        results = self.get_results_for_file_range(
            request,
            view,
            file_range,
            user_annotations=with_user_annotations
            if with_user_annotations is not False
            else True,
            user_id=request.user.id,
            features=with_features,
        )
        if with_user_annotations is not None:
            files = files.filter(
                Exists(results)
                if with_user_annotations is not False
                else ~Exists(results),
            )

        files = files.annotate(
            results_count=Subquery(
                self.get_results_for_file_range(
                    request,
                    view,
                    file_range,
                    user_annotations=True,
                    user_id=request.user.id,
                    features=with_features,
                )
                .annotate(count=Func(F("id"), function="count"))
                .values("count")
            ),
        )

        is_submitted = get_boolean_query_param(request, "is_submitted")
        if is_submitted is not None:
            is_submitted_filter = Exists(
                AnnotationTask.objects.filter(
                    dataset_file_id=OuterRef("id"),
                    status=AnnotationTask.Status.FINISHED,
                    annotator=request.user,
                )
            )
            if is_submitted:
                files = files.filter(is_submitted_filter)
            else:
                files = files.filter(~is_submitted_filter)

        return files.order_by("start", "id")


class AnnotationFilePagination(PageNumberPagination):
    """Custom pagination to allow the front to select the page size"""

    page_size_query_param = "page_size"

    def get_paginated_response(self, data, next_file: Optional[int] = None):
        try:
            count = self.page.paginator.count
        except AttributeError:
            return Response(data)
        response = {
            "count": count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        }
        if next_file:
            response["resume"] = next_file
        return Response(response)


class AnnotationFileRangeFilter(filters.BaseFilterBackend):
    """Filter comment access base on user"""

    def filter_queryset(
        self, request: Request, queryset: QuerySet[AnnotationFileRange], view
    ):
        if request.user.is_staff:
            return queryset
        # When testing with campaign owner which is not an annotators, all items are doubled
        # (don't understand why, the result query is correct when executed directly in SQL console)
        # The .distinct() is necessary to assure the items are not doubled
        return queryset.filter(
            Q(annotation_campaign_phase__annotation_campaign__owner=request.user)
            | (
                Q(annotation_campaign_phase__annotation_campaign__archive__isnull=True)
                & Q(
                    annotation_campaign_phase__file_ranges__annotator__id=request.user.id
                )
            )
        ).distinct()


class AnnotationFileRangeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for annotation file range related actions
    """

    queryset = AnnotationFileRange.objects.select_related(
        "annotator",
        "annotator__aplose",
        "annotation_campaign_phase",
    ).prefetch_related(
        "annotation_campaign_phase__annotation_campaign__datasets",
    )
    serializer_class = AnnotationFileRangeSerializer
    filter_backends = (ModelFilter, AnnotationFileRangeFilter)
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = AnnotationFilePagination

    def get_queryset(self):
        queryset: QuerySet[AnnotationFileRange] = super().get_queryset()
        for_current_user = get_boolean_query_param(self.request, "for_current_user")
        if self.action in ["list", "retrieve"]:
            if for_current_user:
                queryset = queryset.filter(annotator_id=self.request.user.id)
            queryset = queryset.annotate(
                finished_tasks_count=AnnotationFileRange.get_finished_task_count_query()
            )
        return queryset

    def can_user_post_data(self, request_data: list[dict]) -> bool:
        """Check permission to post data for user"""
        if self.request.user.is_staff:
            return True
        required_campaign_phases = AnnotationCampaignPhase.objects.filter(
            id__in=[data["annotation_campaign_phase"] for data in request_data],
        )
        required_owned_campaign_phases = required_campaign_phases.filter(
            annotation_campaign__owner=self.request.user
        )
        # Check if non-staff user is owner of all campaigns where changes are requested
        return (
            required_campaign_phases.count() == required_owned_campaign_phases.count()
        )

    @action(
        methods=["GET"],
        detail=False,
        url_path="phase/(?P<phase_id>[^/.]+)/files",
        url_name="phase-files",
    )
    def list_files(self, request, phase_id: int = None):
        """List files of an annotator within a campaign through its file ranges"""
        queryset: QuerySet[AnnotationFileRange] = self.filter_queryset(
            self.get_queryset()
        ).filter(
            annotator_id=self.request.user.id,
            annotation_campaign_phase_id=phase_id,
        )
        phase: AnnotationCampaignPhase = AnnotationCampaignPhase.objects.filter(
            id=phase_id
        ).first()

        created_annotations_filter = Q(
            annotation_results__annotation_campaign_phase_id=phase_id,
            annotation_results__annotator_id=self.request.user.id,
        )
        # annotation_results_count = Value(0)
        validated_annotation_results_count = Value(0)
        if phase is not None:
            if phase.phase == Phase.ANNOTATION:
                # annotation_results_count = Count(
                #     "annotation_results",
                #     filter=created_annotations_filter,
                #     distinct=True,
                # )
                pass
            if phase.phase == Phase.VERIFICATION:
                annotation_results_count_filter = Q(
                    annotation_results__annotation_campaign_phase__phase=Phase.ANNOTATION,
                    annotation_results__annotation_campaign_phase__annotation_campaign_id=phase.annotation_campaign_id,
                ) & ~Q(annotation_results__annotator_id=self.request.user.id)
                # annotation_results_count = Count(
                #     "annotation_results",
                #     filter=annotation_results_count_filter,
                #     distinct=True,
                # )
                validated_annotation_results_count = Count(
                    "annotation_results",
                    filter=(
                        (
                            annotation_results_count_filter
                            & Q(
                                annotation_results__validations__annotator_id=self.request.user.id,
                                annotation_results__validations__is_valid=True,
                            )
                        )
                        | created_annotations_filter
                    ),
                    distinct=True,
                )
        files: QuerySet[DatasetFile] = (
            AnnotationFileRangeFilesFilter()
            .filter_queryset(request, queryset, self)
            .select_related("dataset", "dataset__audio_metadatum")
            .annotate(
                is_submitted=Exists(
                    AnnotationTask.objects.filter(
                        dataset_file_id=OuterRef("pk"),
                        annotation_campaign_phase_id=phase_id,
                        annotator_id=self.request.user.id,
                        status=AnnotationTask.Status.FINISHED,
                    )
                ),
                # results_count=annotation_results_count,
                validated_results_count=validated_annotation_results_count,
            )
        )
        next_file = files.filter(is_submitted=False).first()
        paginated_files = self.paginate_queryset(files)
        if paginated_files is not None:
            files = files.filter(id__in=[file.id for file in paginated_files])
        serializer = FileRangeDatasetFileSerializer(files, many=True)
        return self.paginator.get_paginated_response(
            serializer.data, next_file=next_file.id if next_file is not None else None
        )

    @action(
        methods=["POST"],
        detail=False,
        url_path="phase/(?P<phase_id>[^/.]+)",
        url_name="phase",
    )
    def update_for_campaign(
        self,
        request,
        phase_id: int = None,
    ):
        """POST an array of annotation file ranges, handle both update and create"""

        phase: AnnotationCampaignPhase = get_object_or_404(
            AnnotationCampaignPhase,
            id=phase_id,
        )

        data = [
            {
                **d,
                "annotation_campaign_phase": phase.id,
            }
            for d in request.data["data"]
        ]

        if not self.can_user_post_data(data):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = AnnotationFileRangeSerializer(
            phase.file_ranges,
            data=data,
            context={
                "force": request.data["force"] if "force" in request.data else False
            },
            many=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            AnnotationFileRangeSerializer(
                phase.file_ranges,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )
