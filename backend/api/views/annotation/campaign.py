"""Annotation campaign DRF-Viewset file"""

from django.db import models, transaction
from django.db.models import (
    Q,
    F,
    Value,
    Case,
    When,
    Exists,
    OuterRef,
    QuerySet,
    Subquery,
    Prefetch,
    Count,
)
from django.db.models.functions import Concat, Extract
from rest_framework import viewsets, status, filters, permissions, mixins
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.utils.serializer_helpers import ReturnDict

from backend.api.models import (
    AnnotationCampaign,
    AnnotationResult,
    AnnotationComment,
    AnnotationFileRange,
)
from backend.api.models.annotation.result import AnnotationResultType
from backend.api.serializers import (
    AnnotationCampaignSerializer,
)
from backend.api.serializers.annotation.campaign import (
    AnnotationCampaignPatchSerializer,
)
from backend.aplose.models.user import ExpertiseLevel
from backend.utils.filters import ModelFilter
from .phase import AnnotationCampaignPhaseViewSet

REPORT_HEADERS = [  # headers
    "dataset",
    "filename",
    "result_id",
    "is_update_of_id",
    "start_time",
    "end_time",
    "start_frequency",
    "end_frequency",
    "annotation",
    "annotator",
    "annotator_expertise",
    "start_datetime",
    "end_datetime",
    "is_box",
    "type",
    "confidence_indicator_label",
    "confidence_indicator_level",
    "comments",
    "signal_quality",
    "signal_start_frequency",
    "signal_end_frequency",
    "signal_relative_max_frequency_count",
    "signal_relative_min_frequency_count",
    "signal_has_harmonics",
    "signal_trend",
    "signal_steps_count",
]


class CampaignAccessFilter(filters.BaseFilterBackend):
    """Filter campaign access base on user"""

    def filter_queryset(self, request: Request, queryset, view):
        if request.user.is_staff:
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
    def has_object_permission(self, request, view, obj: AnnotationCampaign):
        if request.method == "PATCH":
            if obj.archive is not None:
                return False
            if request.user.is_staff or request.user == obj.owner:
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
        .prefetch_related(
            "datasets",
            "labels_with_acoustic_features",
        )
        .annotate(
            files_count=Count("datasets__files", distinct=True),
        )
        .order_by("name")
    )
    serializer_class = AnnotationCampaignSerializer
    filter_backends = (ModelFilter, CampaignAccessFilter, filters.SearchFilter)
    search_fields = ("name",)
    permission_classes = (permissions.IsAuthenticated, CampaignPatchPermission)

    def get_queryset(self):
        self.queryset = self.queryset.prefetch_related(
            Prefetch(
                "phases",
                AnnotationCampaignPhaseViewSet.get_queryset_for_user(self.request.user),
            )
        ).order_by("name")
        return super().get_queryset()

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

    def _report_get_results(self) -> QuerySet[AnnotationResult]:
        campaign: AnnotationCampaign = self.get_object()
        is_box = Case(
            When(type=AnnotationResultType.WEAK, then=0),
            default=1,
            output_field=models.IntegerField(),
        )
        result_type = Case(
            When(type=AnnotationResultType.WEAK, then=Value("WEAK")),
            When(type=AnnotationResultType.POINT, then=Value("POINT")),
            When(type=AnnotationResultType.BOX, then=Value("BOX")),
            default=None,
            output_field=models.CharField(),
        )
        max_confidence = (
            max(
                campaign.confidence_indicator_set.confidence_indicators.values_list(
                    "level", flat=True
                )
            )
            if campaign.confidence_indicator_set
            else 0
        )
        comments = Subquery(
            AnnotationComment.objects.select_related("author")
            .filter(annotation_result_id=OuterRef("id"))
            .annotate(data=Concat(F("comment"), Value(" |- "), F("author__username")))
            .values_list("data", flat=True)
        )
        return (
            AnnotationResult.objects.filter(annotation_campaign_id=campaign.id)
            .select_related(
                "dataset_file",
                "dataset_file__dataset",
                "annotator",
                "annotator__aplose",
                "label",
                "confidence_indicator",
                "acoustic_features",
                "detector_configuration__detector",
            )
            .prefetch_related(
                "comments",
                "comments__author",
            )
            .order_by("dataset_file__start", "dataset_file__id", "id")
            .distinct()
            .annotate(
                dataset=F("dataset_file__dataset__name"),
                filename=F("dataset_file__filename"),
                annotation=F("label__name"),
                annotator_expertise=Case(
                    When(
                        annotator_expertise_level=ExpertiseLevel.NOVICE,
                        then=Value("NOVICE"),
                    ),
                    When(
                        annotator_expertise_level=ExpertiseLevel.AVERAGE,
                        then=Value("AVERAGE"),
                    ),
                    When(
                        annotator_expertise_level=ExpertiseLevel.EXPERT,
                        then=Value("EXPERT"),
                    ),
                    default=F("annotator_expertise_level"),
                    output_field=models.CharField(),
                ),
                is_box=is_box,
                type_label=result_type,
                confidence_indicator_label=F("confidence_indicator__label"),
                confidence_indicator_level=Case(
                    When(
                        confidence_indicator__isnull=False,
                        then=Concat(
                            F("confidence_indicator__level"),
                            Value("/"),
                            max_confidence,
                            output_field=models.CharField(),
                        ),
                    ),
                    default=None,
                ),
                comments_data=comments,
                signal_quality=Case(
                    When(acoustic_features__isnull=False, then=Value("GOOD")),
                    When(
                        label__in=campaign.labels_with_acoustic_features.all(),
                        then=Value("BAD"),
                    ),
                    default=None,
                    output_field=models.CharField(),
                ),
                signal_start_frequency=F("acoustic_features__start_frequency"),
                signal_end_frequency=F("acoustic_features__end_frequency"),
                signal_relative_max_frequency_count=F(
                    "acoustic_features__relative_max_frequency_count"
                ),
                signal_relative_min_frequency_count=F(
                    "acoustic_features__relative_min_frequency_count"
                ),
                signal_has_harmonics=F("acoustic_features__has_harmonics"),
                signal_trend=F("acoustic_features__trend"),
                signal_steps_count=F("acoustic_features__steps_count"),
                _start_time=F("start_time"),
                _end_time=F("end_time"),
                _start_frequency=F("start_frequency"),
                _end_frequency=F("end_frequency"),
                result_id=F("id"),
            )
            .extra(
                select={
                    "start_datetime": """
                    SELECT 
                        CASE 
                            WHEN annotation_results.start_time isnull THEN to_char(f.start::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                            ELSE to_char((f.start + annotation_results.start_time * interval '1 second')::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                        END
                    FROM dataset_files f
                    WHERE annotation_results.dataset_file_id = f.id
                    """,
                    "end_datetime": """
                    SELECT 
                        CASE 
                            WHEN annotation_results.end_time isnull THEN to_char(f.end::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                            ELSE to_char((f.start + annotation_results.end_time * interval '1 second')::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                        END
                    FROM dataset_files f
                    WHERE annotation_results.dataset_file_id = f.id
                    """,
                },
            )
            .values(
                *[
                    i
                    for i in REPORT_HEADERS
                    if i
                    not in (
                        "annotator",
                        "comments",
                        "start_time",
                        "end_time",
                        "start_frequency",
                        "end_frequency",
                        "type",
                    )
                ],
                "annotator__username",
                "comments_data",
                "validations",
                "_start_time",
                "_end_time",
                "_start_frequency",
                "_end_frequency",
                "type_label",
            )
            .annotate(
                annotator=Case(
                    When(annotator__isnull=False, then=F("annotator__username")),
                    When(
                        detector_configuration__detector__isnull=False,
                        then=F("detector_configuration__detector__name"),
                    ),
                    default=Value(""),
                    output_field=models.CharField(),
                ),
                comments=F("comments_data"),
                start_time=Case(
                    When(type=AnnotationResultType.WEAK, then=Value(0.0)),
                    default=F("_start_time"),
                ),
                end_time=Case(
                    When(type=AnnotationResultType.POINT, then=F("_start_time")),
                    When(
                        type=AnnotationResultType.WEAK,
                        then=Extract(F("dataset_file__end"), lookup_name="epoch")
                        - Extract(F("dataset_file__start"), lookup_name="epoch"),
                    ),
                    default=F("_end_time"),
                    output_field=models.FloatField(),
                ),
                start_frequency=Case(
                    When(type=AnnotationResultType.WEAK, then=Value(0.0)),
                    default=F("_start_frequency"),
                ),
                end_frequency=Case(
                    When(type=AnnotationResultType.POINT, then=F("_start_frequency")),
                    When(
                        type=AnnotationResultType.WEAK,
                        then=F("dataset_file__dataset__audio_metadatum__dataset_sr")
                        / 2,
                    ),
                    default=F("_end_frequency"),
                ),
                type=F("type_label"),
            )
        )

    def _report_get_task_comments(self) -> QuerySet[AnnotationComment]:
        campaign: AnnotationCampaign = self.get_object()
        return (
            AnnotationComment.objects.filter(
                annotation_campaign_id=campaign.id,
                annotation_result__isnull=True,
            )
            .select_related("dataset_file", "dataset_file__dataset", "author")
            .annotate(
                dataset=F("dataset_file__dataset__name"),
                filename=F("dataset_file__filename"),
                annotator=F("author__username"),
                comments=Concat(F("comment"), Value(" |- "), F("author__username")),
            )
            .extra(
                select={
                    "start_datetime": """
                    SELECT 
                        to_char(f.start::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                    FROM dataset_files f
                    WHERE annotation_comment.dataset_file_id = f.id
                    """,
                    "end_datetime": """
                    SELECT 
                        to_char(f.end::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                    FROM dataset_files f
                    WHERE annotation_comment.dataset_file_id = f.id
                    """,
                },
            )
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
        if campaign.owner_id != request.user.id and not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)

        campaign.do_archive(request.user)
        return Response(
            self.get_serializer_class()(
                campaign, context=self.get_serializer_context()
            ).data,
            status=status.HTTP_200_OK,
        )
