"""Annotation task DRF-Viewset file"""

from django.db import transaction
from django.db.models import Prefetch
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
        .order_by("dataset_file__audio_metadatum__start")
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
        queryset = campaign.tasks.raw(
            """
                                      SELECT task.id,
                                             task.status,
                                             file.filename,
                                             file.dataset_name,
                                             file.start,
                                             file."end"
                                      FROM annotation_tasks task
                                      LEFT OUTER JOIN 
                                        (SELECT file.id,
                                                filename,
                                                d.name as dataset_name,
                                                a.start,
                                                a."end"
                                         FROM dataset_files file
                                         LEFT JOIN datasets d on file.dataset_id = d.id
                                         LEFT JOIN audio_metadata a on file.audio_metadatum_id = a.id
                                        ) file on file.id = task.dataset_file_id
                                      WHERE annotator_id=%s AND annotation_campaign_id=%s
                                      ORDER BY file.start""",
            (request.user.id, campaign_id),
        )

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # @extend_schema(
    #     parameters=[
    #         OpenApiParameter("campaign_id", int, OpenApiParameter.PATH),
    #         OpenApiParameter("user_id", int, OpenApiParameter.PATH),
    #     ],
    #     responses=AnnotationTaskSerializer(many=True),
    # )
    # @action(
    #     detail=False,
    #     url_path="campaign/(?P<campaign_id>[^/.]+)/user/(?P<user_id>[^/.]+)",
    # )
    # def campaign_user_list(self, request, campaign_id, user_id):
    #     """List tasks for given annotation campaign and user"""
    #     annotation_campaign = get_object_or_404(AnnotationCampaign, pk=campaign_id)
    #     _user = get_object_or_404(User, pk=user_id)
    #     if not request.user.is_staff and not request.user == annotation_campaign.owner:
    #         return HttpResponse("Unauthorized", status=403)
    #
    #     queryset = self.queryset.filter(
    #         annotator_id=user_id, annotation_campaign_id=campaign_id
    #     ).prefetch_related("dataset_file", "dataset_file__dataset")
    #     serializer = self.serializer_class(queryset, many=True)
    #     return Response(serializer.data)

    @extend_schema(responses=AnnotationTaskRetrieveSerializer)
    def retrieve(self, request, pk):
        """Retrieve annotation task instructions to the corresponding id"""
        queryset = self.queryset.prefetch_related(
            "annotation_campaign",
            "annotation_campaign__spectro_configs",
            "annotation_campaign__annotation_set",
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
        serializer = AnnotationTaskRetrieveSerializer(task)

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
