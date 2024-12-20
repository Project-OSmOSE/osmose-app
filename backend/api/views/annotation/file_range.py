"""Viewset for annotation file range"""
from typing import Optional

from django.db.models import QuerySet, Q, Exists, OuterRef, Subquery, Func, F
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationFileRange,
    AnnotationCampaign,
    AnnotationTask,
    AnnotationResult,
    DatasetFile,
)
from backend.api.serializers import (
    AnnotationFileRangeSerializer,
)
from backend.api.serializers.annotation.file_range import FileRangeDatasetFileSerializer
from backend.utils.filters import ModelFilter, get_boolean_query_param


class AnnotationFilePagination(PageNumberPagination):
    """Custom pagination to allow the front to select the page size"""

    page_size_query_param = "page_size"

    def get_paginated_response(self, data, next_file: Optional[int] = None):
        response = {
            "count": self.page.paginator.count,
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
            Q(annotation_campaign__owner=request.user)
            | (
                Q(annotation_campaign__archive__isnull=True)
                & Q(annotation_campaign__annotators__id=request.user.id)
            )
        ).distinct()


class AnnotationFileRangeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for annotation file range related actions
    """

    queryset = AnnotationFileRange.objects.select_related(
        "annotator",
        "annotator__aplose",
        "annotation_campaign",
    ).prefetch_related(
        "annotation_campaign__datasets",
    )
    serializer_class = AnnotationFileRangeSerializer
    filter_backends = (ModelFilter, AnnotationFileRangeFilter)
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = AnnotationFilePagination

    def get_queryset(self):
        queryset: QuerySet[AnnotationFileRange] = super().get_queryset()
        for_current_user = get_boolean_query_param(self.request, "for_current_user")
        if self.action in ["list", "retrieve"] and for_current_user:
            queryset = queryset.filter(annotator_id=self.request.user.id)
        return queryset

    def can_user_post_data(self, request_data: list[dict]) -> bool:
        """Check permission to post data for user"""
        if self.request.user.is_staff:
            return True
        required_campaigns = AnnotationCampaign.objects.filter(
            id__in=[data["annotation_campaign"] for data in request_data],
        )
        required_owned_campaigns = required_campaigns.filter(owner=self.request.user)
        # Check if non-staff user is owner of all campaigns where changes are requested
        return required_campaigns.count() == required_owned_campaigns.count()

    @action(
        methods=["GET"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)/files",
        url_name="campaign-files",
    )
    def list_files(self, request, campaign_id: int = None):
        """List files of an annotator within a campaign through its file ranges"""
        queryset: QuerySet[AnnotationFileRange] = self.filter_queryset(
            self.get_queryset()
        ).filter(annotator_id=self.request.user.id, annotation_campaign_id=campaign_id)
        files: list[any] = []
        for file_range in queryset:
            files.extend(file_range.get_files())

        search = request.query_params.get("search")
        if search is not None:
            files = list(filter(lambda file: search in file.filename, files))
        files = self.paginate_queryset(files) or []
        files = DatasetFile.objects.filter(id__in=[file.id for file in files]).annotate(
            is_submitted=Exists(
                AnnotationTask.objects.filter(
                    annotation_campaign_id=campaign_id,
                    annotator_id=self.request.user.id,
                    dataset_file_id=OuterRef("pk"),
                    status=AnnotationTask.Status.FINISHED,
                )
            ),
            results_count=Subquery(
                AnnotationResult.objects.filter(
                    annotation_campaign_id=campaign_id,
                    dataset_file_id=OuterRef("pk"),
                )
                .filter(
                    Q(annotator_id=self.request.user.id)
                    | Q(detector_configuration__isnull=False)
                )
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            ),
        )
        filtered_list = list(filter(lambda x: not x.is_submitted, files))
        next_file = filtered_list.pop(0) if len(filtered_list) > 0 else None
        serializer = FileRangeDatasetFileSerializer(files, many=True)
        return self.paginator.get_paginated_response(
            serializer.data, next_file=next_file.id if next_file is not None else None
        )

    @action(
        methods=["POST"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)",
        url_name="campaign",
    )
    def update_for_campaign(
        self,
        request,
        campaign_id: int = None,
    ):
        """POST an array of annotation file ranges, handle both update and create"""

        campaign: AnnotationCampaign = get_object_or_404(
            AnnotationCampaign,
            id=campaign_id,
        )

        data = [
            {
                **d,
                "annotation_campaign": campaign.id,
            }
            for d in request.data
        ]

        if not self.can_user_post_data(data):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = AnnotationFileRangeSerializer(
            campaign.annotation_file_ranges,
            data=data,
            many=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            AnnotationFileRangeSerializer(
                campaign.annotation_file_ranges,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )
