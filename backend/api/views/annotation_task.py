"""Annotation task DRF-Viewset file"""

from django.db import transaction
from django.db.models import Prefetch, F, OuterRef, Subquery, Func
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import (
    AnnotationCampaign,
    AnnotationTask,
    AnnotationComment,
    AnnotationResult,
)
from backend.api.serializers import (
    AnnotationTaskSerializer,
    AnnotationTaskRetrieveSerializer,
    AnnotationTaskUpdateSerializer,
    AnnotationTaskUpdateOutputCampaignSerializer,
    AnnotationTaskOneResultUpdateSerializer,
    AnnotationTaskResultSerializer,
)


class AnnotationTaskViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for annotation tasks related actions
    """

    queryset = (
        AnnotationTask.objects.all()
        .prefetch_related("dataset_file__audio_metadatum")
        .order_by("dataset_file__audio_metadatum__start", "id")
    )
    serializer_class = AnnotationTaskSerializer

    @extend_schema(
        parameters=[OpenApiParameter("campaign_id", int, OpenApiParameter.PATH)],
        responses=AnnotationTaskSerializer(many=True),
    )
    @action(detail=False, url_path="campaign/(?P<campaign_id>[^/.]+)")
    def campaign_list(self, request, campaign_id):
        """List tasks for given annotation campaign"""
        campaign = get_object_or_404(AnnotationCampaign, pk=campaign_id)
        queryset = campaign.tasks.filter(annotator_id=request.user.id).annotate(
            filename=F("dataset_file__filename"),
            start=F("dataset_file__audio_metadatum__start"),
            end=F("dataset_file__audio_metadatum__end"),
            dataset_name=F("dataset_file__dataset__name"),
            results_count=Subquery(
                campaign.results.filter(dataset_file_id=OuterRef("dataset_file_id"))
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            ),
        )

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(responses=AnnotationTaskRetrieveSerializer)
    def retrieve(self, request, pk):
        """Retrieve annotation task instructions to the corresponding id"""
        queryset = self.queryset.prefetch_related(
            "annotation_campaign",
            "annotation_campaign__spectro_configs",
            "annotation_campaign__label_set",
            "annotation_campaign__confidence_indicator_set__confidence_indicators",
            "dataset_file__dataset",
            "dataset_file__dataset__spectro_configs",
            "dataset_file__dataset__audio_metadatum",
            Prefetch(
                "task_comments",
                queryset=AnnotationComment.objects.filter(
                    annotation_result=None, annotation_task=pk
                ),
                to_attr="task_comment",
            ),
        )
        task = get_object_or_404(queryset, pk=pk)
        if task.status == 0:
            task.status = 1
            task.save()
        serializer = AnnotationTaskRetrieveSerializer(task, user_id=request.user.id)

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

        task_date = task.dataset_file.audio_metadatum.start
        next_tasks = self.queryset.filter(
            annotator_id=request.user.id,
            annotation_campaign_id=task.annotation_campaign_id,
        ).exclude(status=2)
        next_task = next_tasks.filter(
            dataset_file__audio_metadatum__start__gte=task_date
        ).first()
        if next_task is None:
            next_task = next_tasks.first()
        if next_task is None:
            return Response(
                {"next_task": None, "campaign_id": task.annotation_campaign_id}
            )
        return Response({"next_task": next_task.id, "campaign_id": None})

    @transaction.atomic
    @extend_schema(
        request=AnnotationTaskOneResultUpdateSerializer,
        responses=AnnotationTaskUpdateOutputCampaignSerializer,
    )
    @action(detail=False, url_path="one-result/(?P<pk>[^/.]+)", methods=["put"])
    def update_one_result(self, request, pk):
        """Update an annotation task with new results"""

        queryset = self.queryset.filter(annotator=request.user.id)
        task = get_object_or_404(queryset, pk=pk)
        request.data["annotations"] = [request.data["annotations"]]
        update_serializer = AnnotationTaskOneResultUpdateSerializer(
            task, data=request.data
        )
        update_serializer.is_valid(raise_exception=True)
        task = update_serializer.save()

        queryset = AnnotationResult.objects.latest("id")
        serializer = AnnotationTaskResultSerializer(queryset)
        return Response(serializer.data)
