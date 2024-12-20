"""Annotator viewset"""
from django.db import transaction

# pylint: disable=protected-access
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationCampaign,
    DatasetFile,
    AnnotationTask,
)
from backend.api.serializers import (
    AnnotationSessionSerializer,
)
from backend.api.views import (
    AnnotationCampaignViewSet,
    AnnotationCommentViewSet,
    AnnotationResultViewSet,
    ConfidenceIndicatorSetViewSet,
    DatasetFileViewSet,
    SpectrogramConfigurationViewSet,
    LabelSetViewSet,
)
from .user import UserViewSet


# TODO: test !!!! and update result post ones
class AnnotatorViewSet(viewsets.ViewSet):
    """Annotator viewset"""

    @action(
        methods=["GET"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)/file/(?P<file_id>[^/.]+)",
        url_name="campaign-file",
    )
    def get_file(self, request: Request, campaign_id: int, file_id: int):
        """Get all data for annotator"""

        campaign = AnnotationCampaignViewSet.as_view({"get": "retrieve"})(
            request._request,
            pk=campaign_id,
        ).data
        file = DatasetFileViewSet.as_view({"get": "retrieve"})(
            request._request,
            pk=file_id,
        ).data
        user = UserViewSet.as_view({"get": "self"})(request._request).data

        request._request.GET = {
            "annotation_campaign_id": campaign_id,
            "dataset_file_id": file_id,
            "for_current_user": True,
        }
        results = AnnotationResultViewSet.as_view({"get": "list"})(
            request._request
        ).data
        request._request.GET = {
            "annotation_campaign_id": campaign_id,
            "dataset_file_id": file_id,
            "annotation_result__isnull": True,
            "for_current_user": True,
        }
        task_comments = AnnotationCommentViewSet.as_view({"get": "list"})(
            request._request
        ).data

        request._request.GET = {
            "annotationcampaign__id": campaign_id,
        }
        label_set = LabelSetViewSet.as_view({"get": "list"})(request._request).data[0]
        confidence_set_data = ConfidenceIndicatorSetViewSet.as_view({"get": "list"})(
            request._request
        ).data
        confidence_set = (
            confidence_set_data[0] if len(confidence_set_data) > 0 else None
        )
        request._request.GET = {
            "annotation_campaigns__id": campaign_id,
        }
        spectrogram_configurations = SpectrogramConfigurationViewSet.as_view(
            {"get": "list"}
        )(request._request).data

        campaign_files = AnnotationCampaign.objects.get(
            pk=campaign_id
        ).get_sorted_files()
        current_file = DatasetFile.objects.get(pk=file_id)
        previous_file: DatasetFile = campaign_files.filter(
            Q(start__lt=current_file.start)
            | Q(start=current_file.start, id__lt=current_file.id)
        ).last()
        next_file = campaign_files.filter(
            Q(start__gt=current_file.start)
            | Q(start=current_file.start, id__gt=current_file.id)
        ).first()

        return Response(
            {
                "campaign": campaign,
                "file": file,
                "user": user,
                "results": results,
                "task_comments": task_comments,
                "label_set": label_set,
                "confidence_set": confidence_set,
                "spectrogram_configurations": spectrogram_configurations,
                "previous_file_id": previous_file.id
                if previous_file is not None
                else None,
                "next_file_id": next_file.id if next_file is not None else None,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        methods=["POST"],
        detail=False,
        url_path="campaign/(?P<campaign_id>[^/.]+)/file/(?P<file_id>[^/.]+)",
        url_name="campaign-file-post",
    )
    @transaction.atomic()
    def post(self, request: Request, campaign_id: int, file_id: int):
        """Post all data for annotator"""

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

        # Update
        results = AnnotationResultViewSet.update_results(
            request.data.get("results") or [], campaign, file, request.user.id
        )
        comments = AnnotationCommentViewSet.update_comments(
            request.data.get("task_comments") or [],
            campaign,
            file,
            request.user.id,
        )

        task, _ = AnnotationTask.objects.get_or_create(
            annotator=request.user,
            annotation_campaign_id=campaign_id,
            dataset_file_id=file_id,
        )
        task.status = AnnotationTask.Status.FINISHED
        task.save()
        session_serializer = AnnotationSessionSerializer(
            data={
                **request.data["session"],
                "annotation_task": task.id,
                "session_output": {
                    "results": request.data.get("results"),
                    "task_comments": request.data.get("task_comments"),
                },
            }
        )
        session_serializer.is_valid(raise_exception=True)
        session_serializer.save()

        return Response(
            {
                "results": results,
                "task_comments": comments,
            },
            status=status.HTTP_200_OK,
        )
