"""Annotation comment viewset"""
# pylint: disable=duplicate-code
from django.db.models import QuerySet, Q
from rest_framework import viewsets, permissions, filters, mixins
from rest_framework.request import Request

from backend.api.models import (
    AnnotationResult,
    AnnotationCampaign,
    DatasetFile,
    AnnotationComment,
    AnnotationCampaignPhase,
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

    @staticmethod
    def map_request_comments(
        comments: list[dict], file_id, user_id, phase: AnnotationCampaignPhase
    ):
        """Map rcomments from request with the other request information"""
        return [
            {
                **c,
                "annotation_campaign_phase": phase.id,
                "dataset_file": file_id,
                "author": c["author"]
                if "author" in c and c["author"] is not None
                else user_id,
            }
            for c in comments
        ]

    @staticmethod
    def update_comments(
        new_comments: list[dict],
        campaign: AnnotationCampaign,
        file: DatasetFile,
        user_id,
        phase: AnnotationCampaignPhase,
    ):
        """Update with given comments"""
        data = AnnotationCommentViewSet.map_request_comments(
            new_comments, file.id, user_id, phase
        )
        current_comments = AnnotationCommentViewSet.queryset.filter(
            annotation_campaign_phase__annotation_campaign_id=campaign.id,
            dataset_file_id=file.id,
            author_id=user_id,
            annotation_result__isnull=True,
        )
        serializer = AnnotationCommentViewSet.serializer_class(
            current_comments,
            many=True,
            data=data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer.data
