"""Annotation campaign DRF-Viewset file"""

from backend.api.serializers import (
    AnnotationCampaignSerializer,
)
from backend.api.serializers.annotation.campaign import (
    AnnotationCampaignPatchSerializer,
)
from django.db import transaction
from django.db.models import (
    Q,
    Exists,
    OuterRef,
    Count,
)
from rest_framework import viewsets, status, filters, permissions, mixins
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.utils.serializer_helpers import ReturnDict

from backend.api.models import (
    AnnotationCampaign,
    AnnotationFileRange,
)
from backend.utils.filters import ModelFilter


class CampaignAccessFilter(filters.BaseFilterBackend):
    """Filter campaign access base on user"""

    def filter_queryset(self, request: Request, queryset, view):
        if request.user.is_staff_or_superuser:
            return queryset
        return queryset.filter(
            Q(owner_id=request.user.id)
            | (
                Q(archive__isnull=True)
                & Exists(
                    AnnotationFileRange.objects.filter(
                        annotation_campaign_phase__annotation_campaign_id=OuterRef(
                            "pk"
                        ),
                        annotator_id=request.user.id,
                    )
                )
            )
        )


class CampaignPatchPermission(permissions.BasePermission):
    """Permission for campaign patch query"""

    def has_object_permission(self, request, view, obj: AnnotationCampaign):
        if request.method == "PATCH":
            if obj.archive is not None:
                return False
            if request.user.is_staff_or_superuser or request.user == obj.owner:
                return True
            return False
        return super().has_object_permission(request, view, obj)


class AnnotationCampaignViewSet(
    viewsets.ReadOnlyModelViewSet, mixins.CreateModelMixin, mixins.UpdateModelMixin
):
    """Model viewset for Annotation campaign"""

    queryset = (
        AnnotationCampaign.objects.select_related(
            "owner__aplose",
            "archive__by_user__aplose",
        )
        .prefetch_related("datasets", "labels_with_acoustic_features", "phases")
        .annotate(
            files_count=Count("datasets__files", distinct=True),
        )
        .order_by("name")
    )
    serializer_class = AnnotationCampaignSerializer
    filter_backends = (ModelFilter, CampaignAccessFilter, filters.SearchFilter)
    search_fields = ("name",)
    permission_classes = (permissions.IsAuthenticated, CampaignPatchPermission)

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return AnnotationCampaignPatchSerializer
        return super().get_serializer_class()

    @transaction.atomic()
    def create(self, request, *args, **kwargs):
        response: Response = super().create(request, *args, **kwargs)
        if response.status_code != status.HTTP_201_CREATED:
            return response

        response_data: ReturnDict = response.data
        queryset = self.filter_queryset(self.get_queryset())
        data = self.serializer_class(queryset.get(pk=response_data.get("id"))).data
        return Response(
            data,
            status=status.HTTP_201_CREATED,
            headers=self.get_success_headers(data),
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="archive",
        url_name="archive",
    )
    def archive(self, request, pk: int = None):
        """Archive campaign"""
        # pylint: disable=unused-argument
        campaign: AnnotationCampaign = self.get_object()
        if (
            campaign.owner_id != request.user.id
            and not request.user.is_staff_or_superuser
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)

        campaign.do_archive(request.user)
        return Response(
            self.get_serializer_class()(
                campaign, context=self.get_serializer_context()
            ).data,
            status=status.HTTP_200_OK,
        )
