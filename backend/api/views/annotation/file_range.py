"""Viewset for annotation file range"""
from django.db.models import QuerySet, Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, mixins, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import (
    AnnotationFileRange,
    AnnotationCampaign,
)
from backend.api.serializers import (
    AnnotationFileRangeSerializer,
    AnnotationFileRangeFilesSerializer,
)
from backend.utils.filters import ModelFilter


class AnnotationFileRangeViewSet(
    viewsets.ReadOnlyModelViewSet, mixins.CreateModelMixin, mixins.UpdateModelMixin
):
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
    filter_backends = (ModelFilter,)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"] and self.request.query_params.get(
            "with_files"
        ):
            return AnnotationFileRangeFilesSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset: QuerySet[AnnotationFileRange] = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(annotator=self.request.user)
                | Q(annotation_campaign__owner=self.request.user)
            )
        if self.action in ["list", "retrieve"] and self.request.query_params.get(
            "for_current_user"
        ):
            queryset = queryset.filter(annotator_id=self.request.user.id)
        return queryset

    def can_user_post_data(self, request_data: list[dict]) -> bool:
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
        url_name="update_for_campaign",
    )
    def update_for_campaign(self, request, campaign_id: int = None, *args, **kwargs):
        """POST an array of annotation file ranges, handle both update and create"""

        campaign: AnnotationCampaign = get_object_or_404(
            AnnotationCampaign,
            id=campaign_id,
        )

        def add_campaign(d: dict) -> dict:
            return {
                **d,
                "annotation_campaign": campaign.id,
            }

        data = list(map(add_campaign, request.data))

        if not self.can_user_post_data(data):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

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
