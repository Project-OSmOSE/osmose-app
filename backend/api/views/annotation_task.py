"""Annotation task DRF-Viewset file"""

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, mixins, status
from rest_framework.response import Response

from backend.api.models import (
    AnnotationTask,
    AnnotationComment,
)
from backend.api.serializers import (
    AnnotationTaskRetrieveSerializer,
    AnnotationTaskUpdateSerializer,
    AnnotationTaskUpdateOutputCampaignSerializer,
)
from backend.utils.filters import ModelFilter


class AnnotationTaskViewSet(
    viewsets.ViewSet,
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
):
    """
    A simple ViewSet for annotation tasks related actions
    """

    queryset = AnnotationTask.objects.all().prefetch_related("dataset_file")
    filter_backends = (ModelFilter,)
    serializer_class = AnnotationTaskRetrieveSerializer

    def get_queryset(self):
        """Extend queryset depending on the action"""
        queryset = super().get_queryset()
        if self.action in ["list", "retrieve"]:
            queryset = queryset.prefetch_related(
                "annotation_campaign",
                "annotation_campaign__spectro_configs",
                "annotation_campaign__label_set",
                "annotation_campaign__confidence_indicator_set__confidence_indicators",
                "dataset_file__dataset",
                "dataset_file__dataset__spectro_configs",
                "dataset_file__dataset",
                "task_comments",
            )
            if self.request.query_params.get("for_current_user"):
                queryset = queryset.filter(annotator_id=self.request.user.id)
        return queryset

    def get_serializer_context(self):
        """Return serializer context"""
        context = super().get_serializer_context()
        context.update({"user_id": self.request.user.id})
        return context

    def list(self, request, *args, **kwargs):
        """List tasks"""
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=AnnotationTaskUpdateSerializer,
        responses=AnnotationTaskUpdateOutputCampaignSerializer,
    )
    def update(self, request, pk):
        """Update an annotation task with new results"""

        queryset = self.queryset.filter(annotator=request.user.id)
        task = get_object_or_404(queryset, pk=pk)

        update_serializer = AnnotationTaskUpdateSerializer(task, data=request.data)
        update_serializer.is_valid(raise_exception=True)
        task = update_serializer.save()

        if (
            "task_comments" in request.data.keys()
            and request.data["task_comments"] is not None
            and len(request.data["task_comments"]) > 0
        ):
            for comment in request.data["task_comments"]:
                comment.pop("annotation_task")
                comment.pop("annotation_result")
                message = comment.pop("comment")
                (comment_obj, _) = AnnotationComment.objects.update_or_create(
                    annotation_task=task, annotation_result=None, **comment
                )
                comment_obj.comment = message
                comment_obj.save()
        else:
            AnnotationComment.objects.filter(
                annotation_task=task, annotation_result=None
            ).delete()

        task_date = task.dataset_file.start
        next_tasks = self.queryset.filter(
            annotator_id=request.user.id,
            annotation_campaign_id=task.annotation_campaign_id,
        ).exclude(status=AnnotationTask.Status.FINISHED)
        next_task = next_tasks.filter(dataset_file__start__gte=task_date).first()
        if next_task is None:
            next_task = next_tasks.first()
        if next_task is None:
            return Response(
                {"next_task": None, "campaign_id": task.annotation_campaign_id}
            )
        return Response({"next_task": next_task.id, "campaign_id": None})
