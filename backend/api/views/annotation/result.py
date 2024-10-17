"""Annotation result viewset"""
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
    AnnotationTask,
)
from backend.api.serializers import (
    AnnotationResultSerializer,
    AnnotationResultImportListSerializer,
    AnnotationSessionSerializer,
)
from backend.utils.filters import ModelFilter


class ResultAccessFilter(filters.BaseFilterBackend):
    """Filter result access base on user"""

    def filter_queryset(
        self, request: Request, queryset: QuerySet[AnnotationResult], view
    ):
        if request.user.is_staff:
            return queryset
        return queryset.filter(
            Q(annotation_campaign__owner=request.user)
            | (
                Q(annotation_campaign__archive__isnull=True)
                & (Q(annotator=request.user) | Q(annotator__isnull=True))
            )
        )


class ResultAccessPermission(permissions.BasePermission):
    # pylint: disable=duplicate-code
    """Filter result access base on user"""

    def has_object_permission(self, request, view, obj: AnnotationResult) -> bool:
        if request.user.is_staff:
            return True
        if obj.annotation_campaign.owner_id == request.user.id:
            return True
        if obj.annotation_campaign.archive is not None:
            return False
        return obj.annotator_id == request.user.id or obj.annotator is None


class AnnotationResultViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    A simple ViewSet for annotation result related actions
    """

    queryset = AnnotationResult.objects.all()
    serializer_class = AnnotationResultSerializer
    filter_backends = (ModelFilter, ResultAccessFilter)
    permission_classes = (permissions.IsAuthenticated, ResultAccessPermission)

    def get_queryset(self):
        queryset: QuerySet[AnnotationResult] = super().get_queryset()
        if self.action in ["list", "retrieve"] and self.request.query_params.get(
            "for_current_user"
        ):
            queryset = queryset.filter(
                Q(annotator_id=self.request.user.id) | Q(annotator__isnull=True)
            )
        return queryset

    @action(
        methods=["POST"],
        detail=False,
        url_path="/campaign/(?P<campaign_id>[^/.]+)/file/(?P<file_id>[^/.]+)",
        url_name="campaign-file",
    )
    def bulk_post(self, request, campaign_id, file_id):
        """Bulk post results for annotator"""
        # Check permission
        campaign = get_object_or_404(AnnotationCampaign, id=campaign_id)
        file = get_object_or_404(DatasetFile, id=file_id)
        file_ranges = campaign.annotation_file_ranges.filter(
            annotator_id=request.user.id
        )
        if not file_ranges.exists():
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        all_files = []
        for file_range in file_ranges:
            all_files += list(file_range.get_files())
        if file not in all_files:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        data = [
            {
                **d,
                "annotation_campaign": campaign_id,
                "dataset_file": file_id,
                "annotator": request.user.id,
                "comments": [
                    {
                        **c,
                        "annotation_campaign": campaign_id,
                        "dataset_file": file_id,
                        "author": c["author"]
                        if "author" in c and c["author"] is not None
                        else request.user.id,
                    }
                    for c in (d["comments"] if "comments" in d else [])
                ],
                "validations": [
                    {
                        **v,
                        "annotator": v["annotator"]
                        if "annotator" in v and v["annotator"] is not None
                        else request.user.id,
                    }
                    for v in (d["validations"] if "validations" in d else [])
                ],
            }
            for d in request.data["results"]
        ]

        initial_results = self.get_queryset().filter(
            annotation_campaign_id=campaign_id,
            dataset_file_id=file_id,
            annotator_id=request.user.id,
        )
        serializer = self.get_serializer_class()(
            initial_results,
            many=True,
            data=data,
            context={"campaign": campaign, "file": file},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
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
                "session_output": serializer.data,
            }
        )
        session_serializer.is_valid(raise_exception=True)
        session_serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        methods=["POST"],
        detail=False,
        url_path="/campaign/(?P<campaign_id>[^/.]+)/import",
        url_name="campaign-import",
    )
    def import_results(self, request, campaign_id):
        """Import result from automated detection"""
        # Check permission
        campaign = get_object_or_404(AnnotationCampaign, id=campaign_id)
        if campaign.owner_id != request.user.id and not request.user.is_staff:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        # Execute import
        data = [
            {
                **d,
                "annotation_campaign": campaign_id,
            }
            for d in request.data
        ]
        serializer = AnnotationResultImportListSerializer(
            data=data, context={"campaign": campaign}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        list_serializer = self.get_serializer_class()(serializer.instance, many=True)
        return Response(list_serializer.data, status=status.HTTP_201_CREATED)
