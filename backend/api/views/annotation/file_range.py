"""Viewset for annotation file range"""
from django.db.models import QuerySet, Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationFileRange,
    AnnotationCampaign,
)
from backend.api.serializers import (
    AnnotationFileRangeSerializer,
    AnnotationFileRangeFilesSerializer,
)
from backend.utils.filters import ModelFilter, get_boolean_query_param


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

    def get_serializer_class(self):
        with_files = get_boolean_query_param(self.request, "with_files")
        if self.action in ["list", "retrieve"] and with_files:
            return AnnotationFileRangeFilesSerializer
        return super().get_serializer_class()

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
            for d in request.data["data"]
        ]

        if not self.can_user_post_data(data):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = AnnotationFileRangeSerializer(
            campaign.annotation_file_ranges,
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
                campaign.annotation_file_ranges,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )
