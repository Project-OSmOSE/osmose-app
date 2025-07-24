"""Annotation campaign DRF-Viewset file"""
import csv

from backend.api.models.annotation.result import AnnotationResultType
from backend.api.serializers.annotation.campaign import (
    AnnotationCampaignPhaseSerializer,
)
from django.db import models
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
    Func,
)
from django.db.models.functions import Lower, Concat, Extract, Coalesce
from django.http import HttpResponse
from rest_framework import viewsets, filters, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationResult,
    AnnotationResultValidation,
    AnnotationTask,
    AnnotationComment,
    AnnotationFileRange,
    DatasetFile,
    AnnotationCampaignPhase,
    AnnotationCampaign,
    Phase,
)
from backend.aplose.models.user import ExpertiseLevel
from backend.utils.filters import ModelFilter
from backend.utils.renderers import CSVRenderer

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
    "created_at_phase",
]


class CampaignPhaseAccessFilter(filters.BaseFilterBackend):
    """Filter campaign phase access base on user"""

    def filter_queryset(self, request: Request, queryset, view):
        if request.user.is_staff_or_superuser:
            return queryset
        return queryset.filter(
            Q(annotation_campaign__owner_id=request.user.id)
            | (
                Q(annotation_campaign__archive__isnull=True)
                & Exists(
                    AnnotationFileRange.objects.filter(
                        annotation_campaign_phase_id=OuterRef("pk"),
                        annotator_id=request.user.id,
                    )
                )
            )
        )


class CampaignPhasePostPatchPermission(permissions.BasePermission):
    """Permission for campaign phase post and patch queries"""

    def has_permission(self, request, view):
        if request.method == "POST":
            campaign_id = request.data.get("annotation_campaign", None)
            campaign: QuerySet[AnnotationCampaign] = AnnotationCampaign.objects.filter(
                id=campaign_id
            )
            if campaign.exists():
                campaign: AnnotationCampaign = campaign.first()
                if campaign.archive is not None:
                    return False
                if request.user.is_staff_or_superuser or request.user == campaign.owner:
                    return True
                return False
        return super().has_permission(request, view)

    def has_object_permission(self, request, view, obj: AnnotationCampaignPhase):
        if request.method in ["POST", "PATCH"]:
            if obj.annotation_campaign.archive:
                return False
            if not obj.is_open:
                return False
            if (
                request.user.is_staff_or_superuser
                or request.user == obj.annotation_campaign.owner
            ):
                return True
            return False
        return super().has_object_permission(request, view, obj)


class AnnotationCampaignPhaseViewSet(
    viewsets.ReadOnlyModelViewSet,
    mixins.CreateModelMixin,
):
    """Model viewset for Annotation campaign phase"""

    queryset = AnnotationCampaignPhase.objects.select_related(
        "created_by",
        "ended_by",
    ).annotate(
        global_total=Coalesce(
            Subquery(
                AnnotationFileRange.objects.filter(
                    annotation_campaign_phase_id=OuterRef("pk"),
                )
                .annotate(sum=Func(F("files_count"), function="Sum"))
                .values("sum")
            ),
            Value(0),
        ),
        global_progress=Subquery(
            AnnotationTask.objects.filter(
                annotation_campaign_phase_id=OuterRef("pk"),
                status=AnnotationTask.Status.FINISHED,
            )
            .annotate(count=Func(F("id"), function="count"))
            .values("count")
        ),
    )
    serializer_class = AnnotationCampaignPhaseSerializer
    filter_backends = (ModelFilter, CampaignPhaseAccessFilter)
    permission_classes = (permissions.IsAuthenticated, CampaignPhasePostPatchPermission)

    def create(self, request, *args, **kwargs):
        """Override default create method to automatically fill the created_by field"""
        serializer = self.get_serializer(
            data={
                **request.data,
                "created_by_id": request.user.id,
            }
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user:
            queryset = queryset.annotate(
                user_total=Coalesce(
                    Subquery(
                        AnnotationFileRange.objects.filter(
                            annotator_id=self.request.user.id,
                            annotation_campaign_phase_id=OuterRef("pk"),
                        )
                        .annotate(sum=Func(F("files_count"), function="Sum"))
                        .values("sum")
                    ),
                    Value(0),
                ),
                user_progress=Subquery(
                    AnnotationTask.objects.filter(
                        annotator_id=self.request.user.id,
                        annotation_campaign_phase_id=OuterRef("pk"),
                        status=AnnotationTask.Status.FINISHED,
                    )
                    .annotate(count=Func(F("id"), function="count"))
                    .values("count")
                ),
            )
        return queryset

    def _report_get_results(self) -> QuerySet[AnnotationResult]:
        phase: AnnotationCampaignPhase = self.get_object()
        campaign = phase.annotation_campaign
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
        phase_type = Case(
            When(
                annotation_campaign_phase__phase=Phase.VERIFICATION,
                then=Value("VERIFICATION"),
            ),
            When(
                annotation_campaign_phase__phase=Phase.ANNOTATION,
                then=Value("ANNOTATION"),
            ),
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
            AnnotationResult.objects.filter(
                annotation_campaign_phase__annotation_campaign_id=phase.annotation_campaign_id
            )
            .select_related(
                "dataset_file",
                "dataset_file__dataset",
                "annotator",
                "annotator__aplose",
                "label",
                "confidence_indicator",
                "acoustic_features",
                "detector_configuration__detector",
                "annotation_campaign_phase",
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
                created_at_phase=phase_type,
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
        phase: AnnotationCampaignPhase = self.get_object()
        return (
            AnnotationComment.objects.filter(
                annotation_campaign_phase_id=phase.id,
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
        url_path="report",
        url_name="report",
        renderer_classes=[CSVRenderer],
    )
    def report(self, request, pk: int = None):
        """Download annotation results report csv"""
        # pylint: disable=unused-argument
        phase: AnnotationCampaignPhase = self.get_object()
        campaign = phase.annotation_campaign

        response = HttpResponse(content_type="text/csv")
        filename = f"{campaign.name.replace(' ', '_')}_status.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        validate_users = list(
            AnnotationResultValidation.objects.filter(
                result__annotation_campaign_phase__annotation_campaign_id=phase.annotation_campaign_id
            )
            .select_related("annotator")
            .order_by("annotator__username")
            .values_list("annotator__username", flat=True)
            .distinct()
        )

        # CSV
        headers = REPORT_HEADERS
        if phase.phase == Phase.VERIFICATION:
            headers = headers + validate_users
        writer = csv.DictWriter(response, fieldnames=headers)
        writer.writeheader()

        def map_validations(user: str) -> [str, Case]:
            validation_sub = AnnotationResultValidation.objects.filter(
                annotator__username=user,
                result_id=OuterRef("id"),
            )

            query = Case(
                When(Exists(Subquery(validation_sub.filter(is_valid=True))), then=True),
                When(
                    Exists(Subquery(validation_sub.filter(is_valid=False))), then=False
                ),
                default=None,
                output_field=models.BooleanField(null=True),
            )
            return [user, query]

        results = (
            self._report_get_results()
            .annotate(**dict(map(map_validations, validate_users)))
            .values(*headers)
        )
        comments = self._report_get_task_comments().values(
            "dataset",
            "filename",
            "annotator",
            "start_datetime",
            "end_datetime",
            "comments",
        )

        writer.writerows(list(results) + list(comments))

        return response

    @action(
        detail=True,
        url_path="report-status",
        url_name="report-status",
        renderer_classes=[CSVRenderer],
    )
    def report_status(self, request, pk: int = None):
        """Returns the CSV report on tasks status for the given campaign"""
        # pylint: disable=unused-argument
        phase: AnnotationCampaignPhase = self.get_object()
        campaign = phase.annotation_campaign

        response = HttpResponse(content_type="text/csv")
        filename = f"{campaign.name.replace(' ', '_')}_status.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        # Headers
        header = ["dataset", "filename"]
        file_ranges: QuerySet[AnnotationFileRange] = phase.file_ranges
        annotators = (
            file_ranges.values("annotator__username")
            .distinct()
            .order_by(Lower("annotator__username"))
            .values_list("annotator__username", flat=True)
        )
        header += annotators
        writer = csv.DictWriter(response, fieldnames=header)
        writer.writeheader()

        # Content
        all_files: QuerySet[DatasetFile] = campaign.get_sorted_files().select_related(
            "dataset"
        )
        finished_tasks: QuerySet[AnnotationTask] = phase.tasks.filter(
            status=AnnotationTask.Status.FINISHED,
        )

        def map_annotators(user: str) -> [str, Case]:
            task_sub = finished_tasks.filter(
                dataset_file_id=OuterRef("pk"), annotator__username=user
            )
            range_sub = file_ranges.filter(
                from_datetime__gte=OuterRef("start"),
                to_datetime__lte=OuterRef("end"),
                annotator__username=user,
            )
            query = Case(
                When(Exists(Subquery(task_sub)), then=models.Value("FINISHED")),
                When(Exists(Subquery(range_sub)), then=models.Value("CREATED")),
                default=models.Value("UNASSIGNED"),
                output_field=models.CharField(),
            )
            return [user, query]

        data = dict(map(map_annotators, annotators))

        writer.writerows(
            list(
                all_files.values("dataset__name", "filename", "pk")
                .annotate(dataset=F("dataset__name"), **data)
                .values(*header)
            )
        )
        return response

    @action(detail=True, methods=["POST"], url_path="end", url_name="end")
    def end(self, request, pk: int = None):
        """Ends the given phase"""
        # pylint: disable=unused-argument
        phase: AnnotationCampaignPhase = self.get_object()
        phase.end(self.request.user)
        serializer = self.get_serializer(phase)
        return Response(serializer.data, status=status.HTTP_200_OK)
