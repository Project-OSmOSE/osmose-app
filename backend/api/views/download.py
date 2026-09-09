"""View for file downloads"""
import csv
import io
import zipfile

from django.db import models
from django.db.models import (
    Case,
    When,
    Exists,
    OuterRef,
    Subquery,
    QuerySet,
    F,
    Value,
    Max,
)
from django.db.models.functions import Lower, Concat, Extract
from django.http import HttpResponse
from django_extension.views import CSVRenderer
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.viewsets import ViewSet

from backend.api.models import (
    AnnotationPhase,
    AnnotationValidation,
    AnnotationFileRange,
    Spectrogram,
    AnnotationTask,
    AnnotationComment,
    Annotation,
)
from backend.api.models import (
    SpectrogramAnalysis,
)
from backend.aplose.models import ExpertiseLevel

REPORT_HEADERS = [  # headers
    "dataset",
    "filename",
    "annotation_id",
    "is_update_of_id",
    "start_time",
    "end_time",
    "start_frequency",  # Legacy
    "end_frequency",  # Legacy
    "min_frequency",
    "max_frequency",
    "annotation",
    "annotator",
    "annotator_expertise",
    "start_datetime",
    "end_datetime",
    "is_box",  # Legacy
    "type",
    "confidence_indicator_label",
    "confidence_indicator_level",
    "comments",
    "signal_quantity",
    "signal_is_intensity_too_low",
    "signal_does_overlap_other_signals",
    "signal_start_frequency",
    "signal_end_frequency",
    "signal_relative_min_frequency_count",
    "signal_relative_max_frequency_count",
    "signal_steps_count",
    "signal_has_harmonics",
    "signal_trend",
    "signal_sidebands",
    "signal_subharmonics",
    "signal_frequency_jumps",
    "signal_deterministic_chaos",
    "created_at_phase",
]


def _get_annotations_for_report(
    phase: AnnotationPhase,
) -> QuerySet[Annotation]:
    max_fft = phase.annotation_campaign.analysis.aggregate(
        Max("fft__sampling_frequency")
    )["fft__sampling_frequency__max"]

    expertise_query = Case(
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
    )
    type_query = Case(
        When(type=Annotation.Type.WEAK, then=Value("WEAK")),
        When(type=Annotation.Type.POINT, then=Value("POINT")),
        When(type=Annotation.Type.BOX, then=Value("BOX")),
        default=None,
        output_field=models.CharField(),
    )
    is_box_query = Case(
        When(type=Annotation.Type.WEAK, then=Value(0)),
        default=Value(1),
        output_field=models.IntegerField(),
    )
    max_confidence = (
        max(
            phase.annotation_campaign.confidence_set.confidence_indicators.values_list(
                "level", flat=True
            )
        )
        if phase.annotation_campaign.confidence_set
        else 0
    )
    confidence_level_query = Case(
        When(
            confidence__isnull=False,
            then=Concat(
                F("confidence__level"),
                Value("/"),
                max_confidence,
                output_field=models.CharField(),
            ),
        ),
        default=None,
    )
    comments_query = Subquery(
        AnnotationComment.objects.select_related("author")
        .filter(annotation_id=OuterRef("id"))
        .annotate(data=Concat(F("comment"), Value(" |- "), F("author__username")))
        .values_list("data", flat=True)
    )
    featured_label_ids = list(
        phase.annotation_campaign.labels_with_acoustic_features.values_list(
            "id", flat=True
        )
    )
    signal_quantity_query = Case(
        When(acoustic_features__isnull=False, then=Value("SINGLE")),
        When(
            label__id__in=featured_label_ids,
            then=Value("MULTIPLE"),
        ),
        default=None,
        output_field=models.CharField(),
    )
    signal_frequency_jumps_query = Case(
        When(
            acoustic_features__frequency_jumps_count__isnull=False,
            then=Concat(
                F("acoustic_features__frequency_jumps_count"),
                Value(""),
                output_field=models.CharField(),
            ),
        ),
        When(
            acoustic_features__has_frequency_jumps=True,
            then=Value("True"),
        ),
        When(
            acoustic_features__has_frequency_jumps=False,
            then=Value("False"),
        ),
        default=None,
        output_field=models.CharField(),
    )
    phase_type_query = Case(
        When(
            annotation_phase__phase=AnnotationPhase.Type.VERIFICATION,
            then=Value("VERIFICATION"),
        ),
        When(
            annotation_phase__phase=AnnotationPhase.Type.ANNOTATION,
            then=Value("ANNOTATION"),
        ),
        default=None,
        output_field=models.CharField(),
    )

    annotations = Annotation.objects.filter(
        annotation_phase__annotation_campaign_id=phase.annotation_campaign_id
    )
    if phase.phase == AnnotationPhase.Type.ANNOTATION:
        annotations = annotations.filter(annotation_phase=phase)
    return (
        annotations.distinct()
        .select_related(
            "spectrogram",
            "label",
            "confidence",
            "annotator",
            "acoustic_features",
            "detector_configuration__detector",
            "annotation_phase",
        )
        .prefetch_related(
            "annotation_comments",
            "annotation_comments__author",
        )
        .order_by("spectrogram__start", "spectrogram__id", "id")
        .annotate(
            dataset=Value(phase.annotation_campaign.dataset.name),
            filename=F("spectrogram__filename"),
            annotation=F("label__name"),
            annotator_expertise=expertise_query,
            is_box=is_box_query,
            type_label=type_query,
            confidence_indicator_label=F("confidence__label"),
            confidence_indicator_level=confidence_level_query,
            comments_data=comments_query,
            signal_quantity=signal_quantity_query,
            signal_is_intensity_too_low=F("acoustic_features__is_intensity_too_low"),
            signal_does_overlap_other_signals=F(
                "acoustic_features__does_overlap_other_signals"
            ),
            signal_start_frequency=F("acoustic_features__start_frequency"),
            signal_end_frequency=F("acoustic_features__end_frequency"),
            signal_relative_min_frequency_count=F(
                "acoustic_features__relative_min_frequency_count"
            ),
            signal_relative_max_frequency_count=F(
                "acoustic_features__relative_max_frequency_count"
            ),
            signal_steps_count=F("acoustic_features__steps_count"),
            signal_has_harmonics=F("acoustic_features__has_harmonics"),
            signal_trend=F("acoustic_features__trend"),
            signal_sidebands=F("acoustic_features__has_sidebands"),
            signal_subharmonics=F("acoustic_features__has_subharmonics"),
            signal_frequency_jumps=signal_frequency_jumps_query,
            signal_deterministic_chaos=F("acoustic_features__has_deterministic_chaos"),
            _start_time=F("start_time"),
            _end_time=F("end_time"),
            min_frequency=Case(
                When(type=Annotation.Type.WEAK, then=Value(0.0)),
                default=F("start_frequency"),
                output_field=models.FloatField(),
            ),
            max_frequency=Case(
                When(type=Annotation.Type.POINT, then=F("start_frequency")),
                When(
                    type=Annotation.Type.WEAK,
                    then=max_fft / 2,
                ),
                default=F("end_frequency"),
                output_field=models.FloatField(),
            ),
            annotation_id=F("id"),
            created_at_phase=phase_type_query,
        )
        .extra(
            select={
                "start_datetime": """
                    SELECT 
                        CASE 
                            WHEN api_annotation.type = 'W' THEN to_char(f.start::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                            ELSE to_char((f.start + api_annotation.start_time * interval '1 second')::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                        END
                    FROM api_spectrogram f
                    WHERE api_annotation.spectrogram_id = f.id
                    """,
                "end_datetime": """
                    SELECT 
                        CASE 
                            WHEN api_annotation.type = 'W' THEN to_char(f.end::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                            WHEN api_annotation.type = 'P' THEN to_char((f.start + api_annotation.start_time * interval '1 second')::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                            ELSE to_char((f.start + api_annotation.end_time * interval '1 second')::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                        END
                    FROM api_spectrogram f
                    WHERE api_annotation.spectrogram_id = f.id
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
                When(type=Annotation.Type.WEAK, then=Value(0.0)),
                default=F("_start_time"),
                output_field=models.FloatField(),
            ),
            end_time=Case(
                When(type=Annotation.Type.POINT, then=F("_start_time")),
                When(
                    type=Annotation.Type.WEAK,
                    then=Extract(F("spectrogram__end"), lookup_name="epoch")
                    - Extract(F("spectrogram__start"), lookup_name="epoch"),
                ),
                default=F("_end_time"),
                output_field=models.FloatField(),
            ),
            start_frequency=F("min_frequency"),
            end_frequency=F("max_frequency"),
            type=F("type_label"),
        )
    )


def _get_task_comments_for_report(
    phase: AnnotationPhase,
) -> QuerySet[AnnotationComment]:
    return (
        AnnotationComment.objects.filter(
            annotation_phase=phase,
            annotation__isnull=True,
        )
        .select_related(
            "spectrogram",
            "author",
        )
        .annotate(
            dataset=Value(phase.annotation_campaign.dataset.name),
            filename=F("spectrogram__filename"),
            annotator=F("author__username"),
            comments=Concat(F("comment"), Value(" |- "), F("author__username")),
        )
        .extra(
            select={
                "start_datetime": """
                SELECT 
                    to_char(f.start::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                FROM api_spectrogram f
                WHERE api_annotationcomment.spectrogram_id = f.id
                """,
                "end_datetime": """
                SELECT 
                    to_char(f.end::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSOF":00"')
                FROM api_spectrogram f
                WHERE api_annotationcomment.spectrogram_id = f.id
                """,
            },
        )
    )


class DownloadViewSet(ViewSet):
    """Download view set"""

    @action(
        detail=False,
        url_path="analysis-export/(?P<pk>[^/.]+)",
        url_name="analysis-export",
    )
    def download_analysis_export(self, _request, pk=None):
        """
        Download analysis export
        For legacy analysis: audio metadata and spectro config csv
        For current analysis: TODO: translate in new osekit
        """
        analysis: SpectrogramAnalysis = get_object_or_404(
            SpectrogramAnalysis.objects.all(), pk=pk
        )

        # Create a buffer to write the zipfile into
        zip_buffer = io.BytesIO()

        analysis.get_osekit_spectro_dataset_serialized_path()

        # Create the zipfile, giving the buffer as the target
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            if analysis.legacy:
                zip_file.writestr(
                    "audio_metadatum.csv",
                    data=analysis.legacy_audio_metadatum_csv().encode("utf-8"),
                )
                zip_file.writestr(
                    "spectrogram_configuration.csv",
                    data=analysis.legacy_spectrogram_configuration_csv().encode(
                        "utf-8"
                    ),
                )
            else:
                with open(
                    analysis.get_osekit_spectro_dataset_serialized_path(),
                    "r",
                    encoding="utf-8",
                ) as file:
                    zip_file.writestr(f"{analysis.name}.json", file.read())

        response = HttpResponse(content_type="application/x-zip-compressed")
        response["Content-Disposition"] = f"attachment; filename={analysis.name}.zip"
        # Write the value of our buffer to the response
        response.write(zip_buffer.getvalue())
        return response

    @action(
        detail=False,
        url_path="phase-annotations/(?P<pk>[^/.]+)",
        url_name="phase-annotations",
        renderer_classes=[CSVRenderer],
    )
    def download_phase_annotations(self, request, pk=None):
        """Download annotation results csv"""
        phase = AnnotationPhase.objects.get_viewable_or_fail(request.user, pk=pk)
        campaign = phase.annotation_campaign

        response = HttpResponse(content_type="text/csv")
        filename = f"{campaign.name.replace(' ', '_')}_{AnnotationPhase.Type(phase.phase).label}_annotations.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        validate_users = list(
            AnnotationValidation.objects.filter(
                annotation__annotation_phase__annotation_campaign_id=phase.annotation_campaign_id
            )
            .select_related("annotator")
            .order_by("annotator__username")
            .values_list("annotator__username", flat=True)
            .distinct()
        )

        # CSV
        headers = REPORT_HEADERS
        if phase.phase == AnnotationPhase.Type.VERIFICATION:
            headers = headers + validate_users
        writer = csv.DictWriter(response, fieldnames=headers)
        writer.writeheader()

        def map_validations(user: str) -> tuple[str, Case]:
            validation_sub = AnnotationValidation.objects.filter(
                annotator__username=user,
                annotation_id=OuterRef("id"),
            )

            query = Case(
                When(Exists(Subquery(validation_sub.filter(is_valid=True))), then=True),
                When(
                    Exists(Subquery(validation_sub.filter(is_valid=False))), then=False
                ),
                default=None,
                output_field=models.BooleanField(null=True),
            )
            return user, query

        results = (
            _get_annotations_for_report(phase)
            .annotate(**dict(map(map_validations, validate_users)))
            .values(*headers)
        )
        comments = _get_task_comments_for_report(phase).values(
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
        detail=False,
        url_path="phase-progression/(?P<pk>[^/.]+)",
        url_name="phase-progression",
        renderer_classes=[CSVRenderer],
    )
    def download_phase_progression(self, request, pk=None):
        """Returns the CSV report on tasks status for the given campaign"""
        phase = AnnotationPhase.objects.get_viewable_or_fail(request.user, pk=pk)
        campaign = phase.annotation_campaign

        response = HttpResponse(content_type="text/csv")
        filename = f"{campaign.name.replace(' ', '_')}_{AnnotationPhase.Type(phase.phase).label}_status.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        # Headers
        header = ["dataset", "filename"]
        file_ranges: QuerySet[AnnotationFileRange] = phase.annotation_file_ranges
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
        all_files: QuerySet[Spectrogram] = campaign.get_sorted_files().select_related(
            "dataset"
        )
        finished_tasks: QuerySet[AnnotationTask] = phase.annotation_tasks.filter(
            status=AnnotationTask.Status.FINISHED,
        )

        def map_annotators(user: str) -> tuple[str, Case]:
            task_sub = finished_tasks.filter(
                spectrogram_id=OuterRef("pk"), annotator__username=user
            )
            range_sub = file_ranges.filter(
                from_datetime__lte=OuterRef("start"),
                to_datetime__gte=OuterRef("end"),
                annotator__username=user,
            )
            query = Case(
                When(Exists(Subquery(task_sub)), then=models.Value("FINISHED")),
                When(Exists(Subquery(range_sub)), then=models.Value("CREATED")),
                default=models.Value("UNASSIGNED"),
                output_field=models.CharField(),
            )
            return user, query

        data = dict(map(map_annotators, annotators))

        writer.writerows(
            list(
                all_files.values("filename", "pk")
                .annotate(dataset=Value(phase.annotation_campaign.dataset.name), **data)
                .values(*header)
            )
        )
        return response
