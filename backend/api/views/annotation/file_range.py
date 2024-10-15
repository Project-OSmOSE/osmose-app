"""Viewset for annotation file range"""
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, mixins, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import (
    AnnotationFileRange,
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
        queryset = super().get_queryset()
        if self.action in ["list", "retrieve"] and self.request.query_params.get(
            "for_current_user"
        ):
            queryset = queryset.filter(annotator_id=self.request.user.id)
        return queryset

    @action(methods=["POST"], detail=False, url_path="many", url_name="many")
    def send_many(self, request, *args, **kwargs):
        """POST an array of annotation file ranges, handle both update and create"""
        instances = []
        update_serializers = []
        create_serializers = []
        for data in request.data:
            duplicates = AnnotationFileRange.objects.filter(
                annotator_id=data["annotator"],
                annotation_campaign_id=data["annotation_campaign"],
                first_file_index=data["first_file_index"],
                last_file_index=data["last_file_index"],
            )
            if duplicates.exists():
                instances.append(duplicates.first())
            elif "id" in data and data["id"] is not None:
                # update
                instance = get_object_or_404(AnnotationFileRange, id=data["id"])
                finished_tasks = instance.get_finished_tasks().count()
                if finished_tasks > 0:
                    raise serializers.ValidationError(
                        f"The range for annotator {instance.annotator.username} contains finished tasks, "
                        f"it cannot be updated",
                        code="deleted_results",
                    )

                serializer = self.get_serializer(instance, data=data)
                serializer.is_valid(raise_exception=True)
                update_serializers.append(serializer)
            else:
                # create
                serializer: AnnotationFileRangeSerializer = self.get_serializer(
                    data=data
                )
                serializer.is_valid(raise_exception=True)
                create_serializers.append(serializer)
        for serializer in update_serializers:
            self.perform_update(serializer)
            instances.append(serializer.instance)
        for serializer in create_serializers:
            self.perform_create(serializer)
            instances.append(serializer.instance)
        ranges = AnnotationFileRange.clean_connected_ranges(instances)
        return Response(
            self.serializer_class(ranges, many=True).data,
            status=status.HTTP_200_OK,
        )
