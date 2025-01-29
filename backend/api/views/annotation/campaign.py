"""Annotation campaign DRF-Viewset file"""
from datetime import timedelta

from django.db import transaction
from django.db.models import (
    Q,
    F,
    BooleanField,
    ExpressionWrapper,
    Value,
    FloatField,
    DurationField,
    Exists,
    OuterRef,
    QuerySet,
    Prefetch,
)
from django.db.models.functions import Lower, Cast, Extract
from rest_framework import viewsets, status, filters, permissions, mixins
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.utils.serializer_helpers import ReturnDict

from backend.api.models import (
    AnnotationCampaign,
    AnnotationResult,
    AnnotationResultValidation,
    AnnotationTask,
    AnnotationComment,
    AnnotationCampaignUsage,
    AnnotationFileRange,
    DatasetFile,
)
from backend.api.serializers import (
    AnnotationCampaignSerializer,
)
from backend.aplose.models import User
from backend.utils.filters import ModelFilter
from backend.utils.renderers import CSVRenderer

REPORT_HEADERS = [  # headers
    "dataset",
    "filename",
    "start_time",
    "end_time",
    "start_frequency",
    "end_frequency",
    "annotation",
    "annotator",
    "start_datetime",
    "end_datetime",
    "is_box",
    "confidence_indicator_label",
    "confidence_indicator_level",
    "comments",
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
                        annotation_campaign_id=OuterRef("pk"),
                        annotator_id=request.user.id,
                    )
                )
            )
        )


class AnnotationCampaignViewSet(viewsets.ReadOnlyModelViewSet, mixins.CreateModelMixin):
    """Model viewset for Annotation campaign"""

    queryset = AnnotationCampaign.objects.select_related(
        "owner",
        "archive",
        "archive__by_user",
        "archive__by_user__aplose",
    ).prefetch_related(
        "datasets",
        "labels_with_acoustic_features",
        "spectro_configs",
        Prefetch("annotators", queryset=User.objects.distinct()),
    )
    serializer_class = AnnotationCampaignSerializer
    filter_backends = (ModelFilter, CampaignAccessFilter, filters.SearchFilter)
    search_fields = ("name",)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = (
            super()
            .get_queryset()
            .extra(
                select={
                    "files_count": """
                        SELECT count(*) FROM dataset_files f
                        LEFT JOIN annotation_campaigns_datasets d on d.dataset_id = f.dataset_id
                        WHERE d.annotationcampaign_id = annotation_campaigns.id
                    """,
                    "my_progress": """
                        SELECT count(*) FROM api_annotationtask t
                        WHERE t.annotation_campaign_id = annotation_campaigns.id AND t.annotator_id = %s AND t.status = 'F'
                    """,
                    "my_total": """
                        SELECT case when total notnull then total else 0 end as data FROM 
                            (SELECT sum(files_count) as total FROM api_annotationfilerange r
                            WHERE r.annotation_campaign_id = annotation_campaigns.id AND r.annotator_id = %s) as info
                    """,
                    "progress": """
                        SELECT count(*) FROM api_annotationtask t
                        WHERE t.annotation_campaign_id = annotation_campaigns.id AND t.status = 'F'
                    """,
                    "total": """
                        SELECT case when total notnull then total else 0 end as data FROM 
                            (SELECT sum(files_count) as total FROM api_annotationfilerange r
                            WHERE r.annotation_campaign_id = annotation_campaigns.id) as info
                    """,
                },
                select_params=(
                    self.request.user.id,
                    self.request.user.id,
                ),
            )
            .order_by("name")
        )
        return queryset

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
        url_path="report",
        url_name="report",
        renderer_classes=[CSVRenderer],
    )
    def report(self, request, pk: int = None):
        """Download annotation results report csv"""
        # pylint: disable=too-many-locals, too-many-statements
        campaign: AnnotationCampaign = self.get_object()
        max_confidence = (
            max(
                campaign.confidence_indicator_set.confidence_indicators.values_list(
                    "level", flat=True
                )
            )
            if campaign.confidence_indicator_set
            else 0
        )

        file_duration = Cast(
            Extract(
                ExpressionWrapper(
                    F("dataset_file__end") - F("dataset_file__start"),
                    output_field=DurationField(),
                ),
                "epoch",
            ),
            FloatField(),
        )
        file_max_frequency = ExpressionWrapper(
            F("dataset_file__dataset__audio_metadatum__dataset_sr") / 2,
            output_field=FloatField(),
        )
        results = (
            AnnotationResult.objects.filter(annotation_campaign_id=pk)
            .select_related(
                "dataset_file",
                "dataset_file__dataset",
                "dataset_file__dataset__audio_metadatum",
                "label",
                "confidence_indicator",
                "annotator",
                "detector_configuration__detector",
                "acoustic_features",
            )
            .annotate(
                file_duration=file_duration,
                file_max_frequency=file_max_frequency,
                file_name=F("dataset_file__filename"),
                dataset_name=F("dataset_file__dataset__name"),
                file_start=F("dataset_file__start"),
                file_end=F("dataset_file__end"),
                label_name=F("label__name"),
                annotator_name=F("annotator__username"),
                detector_name=F("detector_configuration__detector__name"),
                comment_content=F("comments__comment"),
                comment_author=F("comments__author__username"),
                confidence_label=F("confidence_indicator__label"),
                confidence_level=F("confidence_indicator__level"),
                is_weak=ExpressionWrapper(
                    (Q(start_time__isnull=True) | Q(start_time=0))
                    & (Q(end_time__isnull=True) | Q(end_time=file_duration))
                    & (Q(start_frequency__isnull=True) | Q(start_frequency=0))
                    & (
                        Q(end_frequency__isnull=True)
                        | Q(end_frequency=file_max_frequency)
                    ),
                    output_field=BooleanField(),
                ),
                feature_start_freq=F("acoustic_features__start_frequency"),
                feature_end_freq=F("acoustic_features__end_frequency"),
                feature_relative_max_frequency_count=F(
                    "acoustic_features__relative_max_frequency_count"
                ),
                feature_relative_min_frequency_count=F(
                    "acoustic_features__relative_min_frequency_count"
                ),
                feature_has_harmonics=F("acoustic_features__has_harmonics"),
                feature_harmonics_count=F("acoustic_features__harmonics_count"),
                feature_trend=F("acoustic_features__trend"),
                feature_steps_count=F("acoustic_features__steps_count"),
            )
            .order_by("dataset_file__start", "id")
        )
        comments = (
            AnnotationComment.objects.filter(
                annotation_campaign_id=pk,
                annotation_result__isnull=True,
            )
            .select_related(
                "dataset_file",
                "dataset_file__dataset",
                "author",
            )
            .annotate(
                file_name=F("dataset_file__filename"),
                dataset_name=F("dataset_file__dataset__name"),
                annotator_name=F("author__username"),
                comment_content=F("comment"),
                comment_author=F("author__username"),
                start_time=Value(""),
                end_time=Value(""),
                start_frequency=Value(""),
                end_frequency=Value(""),
                label_name=Value(""),
                confidence_label=Value(""),
                confidence_level=Value(""),
                is_weak=Value(""),
                file_start=F("dataset_file__start"),
                file_end=F("dataset_file__end"),
                file_max_frequency=ExpressionWrapper(
                    F("dataset_file__dataset__audio_metadatum__dataset_sr") / 2,
                    output_field=FloatField(),
                ),
            )
            .extra(
                select={
                    "file_duration": 'SELECT EXTRACT(EPOCH FROM ("end" - start)) '
                    "FROM dataset_files f "
                    "WHERE f.id = annotation_comment.dataset_file_id"
                },
            )
        )
        validations = (
            AnnotationResultValidation.objects.filter(
                result__annotation_campaign=campaign
            )
            .prefetch_related("annotator")
            .order_by("annotator__username")
        )
        validate_users = list(
            validations.values_list("annotator__username", flat=True).distinct()
        )

        data = [REPORT_HEADERS]

        def map_result(row):
            return [
                row.dataset_name,
                row.file_name,
                str(row.start_time) if row.start_time else "0",
                str(row.end_time) if row.end_time else str(row.file_duration),
                str(row.start_frequency) if row.start_frequency else "0",
                str(row.end_frequency)
                if row.end_frequency
                else str(row.file_max_frequency),
                row.label_name,
                row.annotator_name if row.annotator_name else row.detector_name,
                (row.file_start + timedelta(seconds=row.start_time or 0)).isoformat(
                    timespec="milliseconds"
                ),
                (row.file_start + timedelta(seconds=row.end_time)).isoformat(
                    timespec="milliseconds"
                )
                if row.end_time
                else row.file_end.isoformat(timespec="milliseconds"),
                str(1 if campaign.annotation_scope == 1 or not row.is_weak else 0)
                if isinstance(row.is_weak, bool)
                else "",
                row.confidence_label if row.confidence_label else "",
                f"{row.confidence_level}/{max_confidence}"
                if isinstance(row.confidence_level, int)
                else "",
                f'"{row.comment_content} |- {row.comment_author}"'
                if row.comment_content
                else "",
            ]

        def map_result_features(row):
            data = map_result(row)
            data.append(
                str(row.feature_min_freq)
                if "feature_min_freq" in vars(row) and row.feature_min_freq
                else ""
            )
            data.append(
                str(row.feature_max_freq)
                if "feature_max_freq" in vars(row) and row.feature_max_freq
                else ""
            )
            data.append(
                str(row.feature_start_freq)
                if "feature_start_freq" in vars(row) and row.feature_start_freq
                else ""
            )
            data.append(
                str(row.feature_end_freq)
                if "feature_end_freq" in vars(row) and row.feature_end_freq
                else ""
            )
            data.append(
                str(row.feature_median_freq)
                if "feature_median_freq" in vars(row) and row.feature_median_freq
                else ""
            )
            data.append(
                str(row.feature_beginning_sweep_slope)
                if "feature_beginning_sweep_slope" in vars(row)
                and row.feature_beginning_sweep_slope
                else ""
            )
            data.append(
                str(row.feature_end_sweep_slope)
                if "feature_end_sweep_slope" in vars(row)
                and row.feature_end_sweep_slope
                else ""
            )
            data.append(
                str(row.feature_steps_count)
                if "feature_steps_count" in vars(row) and row.feature_steps_count
                else ""
            )
            data.append(
                str(row.feature_relative_peaks_count)
                if "feature_relative_peaks_count" in vars(row)
                and row.feature_relative_peaks_count
                else ""
            )
            data.append(
                str(row.feature_has_harmonics)
                if "feature_has_harmonics" in vars(row) and row.feature_has_harmonics
                else ""
            )
            data.append(
                str(row.feature_harmonics_count)
                if "feature_harmonics_count" in vars(row)
                and row.feature_harmonics_count
                else ""
            )
            data.append(
                str(row.feature_level_peak_frequency)
                if "feature_level_peak_frequency" in vars(row)
                and row.feature_level_peak_frequency
                else ""
            )
            data.append(
                str(row.feature_duration)
                if "feature_duration" in vars(row) and row.feature_duration
                else ""
            )
            data.append(
                str(row.feature_trend)
                if "feature_trend" in vars(row) and row.feature_trend
                else ""
            )
            return data

        def map_result_check(row):
            check_data = map_result(row)
            for user in validate_users:
                validation = validations.filter(
                    result__id=row.id, annotator__username=user
                )
                check_data.append(
                    str(validation.first().is_valid) if validation.count() > 0 else ""
                )
            return check_data

        if campaign.usage == AnnotationCampaignUsage.CREATE:
            if campaign.labels_with_acoustic_features.count() > 0:
                data[0].append("signal_start_frequency")
                data[0].append("signal_end_frequency")
                data[0].append("signal_relative_max_frequency_count")
                data[0].append("signal_relative_min_frequency_count")
                data[0].append("signal_has_harmonics")
                data[0].append("signal_trend")
                data[0].append("signal_steps_count")
                data.extend(map(map_result_features, list(results) + list(comments)))
            else:
                data.extend(map(map_result, list(results) + list(comments)))

        if campaign.usage == AnnotationCampaignUsage.CHECK:
            data[0] = data[0] + validate_users
            data.extend(map(map_result_check, list(results) + list(comments)))

        response = Response(data)
        response[
            "Content-Disposition"
        ] = f'attachment; filename="{campaign.name.replace(" ", "_")}.csv"'
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
        campaign: AnnotationCampaign = self.get_object()

        # Headers
        header = ["dataset", "filename"]
        file_ranges: QuerySet[AnnotationFileRange] = campaign.annotation_file_ranges
        annotators = (
            file_ranges.values("annotator__username")
            .distinct()
            .order_by(Lower("annotator__username"))
            .values_list("annotator__username", flat=True)
        )
        data = [header + list(annotators)]

        # Content
        files: QuerySet[DatasetFile] = campaign.get_sorted_files().select_related(
            "dataset"
        )
        finished_tasks: QuerySet[AnnotationTask] = campaign.tasks.filter(
            status=AnnotationTask.Status.FINISHED
        )
        for [index, file] in enumerate(files):
            row = []
            row.append(file.dataset.name)
            row.append(file.filename)
            for annotator in annotators:
                annotation_status = "UNASSIGNED"
                if finished_tasks.filter(
                    annotator__username=annotator, dataset_file_id=file.id
                ).exists():
                    annotation_status = "FINISHED"
                elif file_ranges.filter(
                    annotator__username=annotator,
                    first_file_index__lte=index,
                    last_file_index__gte=index,
                ).exists():
                    annotation_status = "CREATED"
                row.append(annotation_status)
            data.append(row)

        response = Response(data)
        response[
            "Content-Disposition"
        ] = f'attachment; filename="{campaign.name.replace(" ", "_")}_status.csv"'
        return response

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
