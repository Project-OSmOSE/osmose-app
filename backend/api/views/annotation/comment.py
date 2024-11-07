"""Annotation comment viewset"""
# pylint: disable=duplicate-code
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
    AnnotationComment,
)
from backend.api.serializers import (
    AnnotationCommentSerializer,
)
from backend.utils.filters import ModelFilter, get_boolean_query_param


class CommentAccessFilter(filters.BaseFilterBackend):
    """Filter comment access base on user"""

    def filter_queryset(
        self, request: Request, queryset: QuerySet[AnnotationComment], view
    ):
        if request.user.is_staff:
            return queryset
        return queryset.filter(
            Q(annotation_campaign__owner=request.user)
            | Q(annotation_campaign__archive__isnull=True)
        )


class AnnotationCommentViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    A simple ViewSet for annotation comment related actions
    """

    queryset = AnnotationComment.objects.all()
    serializer_class = AnnotationCommentSerializer
    filter_backends = (ModelFilter, CommentAccessFilter)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset: QuerySet[AnnotationResult] = super().get_queryset()
        for_current_user = get_boolean_query_param(self.request, "for_current_user")
        if self.action in ["list", "retrieve"] and for_current_user:
            queryset = queryset.filter(author_id=self.request.user.id)
        return queryset

    @action(
        methods=["POST"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)/file/(?P<file_id>[^/.]+)/global",
        url_name="campaign-file-global",
    )
    def bulk_post_global_comment(self, request, campaign_id, file_id):
        """Bulk post without result comments for annotator"""
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
                **c,
                "annotation_campaign": campaign_id,
                "dataset_file": file_id,
                "author": c["author"]
                if "author" in c and c["author"] is not None
                else request.user.id,
            }
            for c in request.data
        ]

        initial_comments = self.get_queryset().filter(
            annotation_campaign_id=campaign_id,
            dataset_file_id=file_id,
            author_id=request.user.id,
            annotation_result__isnull=True,
        )
        serializer = self.get_serializer_class()(
            initial_comments,
            many=True,
            data=data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
