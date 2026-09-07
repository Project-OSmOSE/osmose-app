from django.db.models import Exists, Subquery, OuterRef, Q
from django_extension.filters import ExtendedFilterSet, IDFilter
from django_filters import OrderingFilter, BooleanFilter, CharFilter
from graphene_django.filter import TypedFilter

from backend.api.models import (
    Spectrogram,
    AnnotationFileRange,
    AnnotationTask,
    Annotation,
    AnnotationPhase,
)
from backend.api.schema.enums import AnnotationPhaseType


class SpectrogramFilterSet(ExtendedFilterSet):
    """Spectrogram filters"""

    campaign_id = IDFilter(field_name="analysis__annotation_campaigns__id")
    phase_type = TypedFilter(input_type=AnnotationPhaseType, method="fake_filter")
    annotator_id = IDFilter(method="fake_filter")

    is_task_completed = BooleanFilter(method="fake_filter")
    has_annotations = BooleanFilter(method="fake_filter")
    annotated_by_annotator = IDFilter(method="fake_filter")
    annotated_by_detector = IDFilter(method="fake_filter")
    annotated_with_label = CharFilter(method="fake_filter")
    annotated_with_confidence = CharFilter(method="fake_filter")
    annotated_with_features = BooleanFilter(method="fake_filter")

    class Meta:
        model = Spectrogram
        fields = {
            "start": ["exact", "lt", "lte", "gt", "gte"],
            "end": ["exact", "lt", "lte", "gt", "gte"],
        }

    order_by = OrderingFilter(fields=(("start", "start"),))

    def fake_filter(self, queryset, name, value):
        """Fake filter method - Filter is directly used in the filter_queryset method"""
        return queryset

    def filter_queryset(self, queryset):
        compatible_file_ranges = AnnotationFileRange.objects.all()
        compatible_tasks = AnnotationTask.objects.all()
        compatible_annotations = Annotation.objects.all()

        if self.data == {}:
            return super().filter_queryset(queryset)

        f = Q()
        if self.data.get("campaign_id"):
            f &= Q(
                annotation_phase__annotation_campaign_id=self.data.get("campaign_id")
            )
        if self.data.get("phase_type"):
            f &= Q(
                annotation_phase__phase=AnnotationPhase.Type.values[
                    AnnotationPhase.Type.labels.index(self.data.get("phase_type"))
                ]
            )
        compatible_annotations = compatible_annotations.filter(f)
        if self.data.get("annotator_id"):
            f &= Q(annotator_id=self.data.get("annotator_id"))

        compatible_file_ranges = compatible_file_ranges.filter(f)
        compatible_tasks = compatible_tasks.filter(f)

        if self.data.get("is_task_completed"):
            queryset = queryset.filter(
                Exists(
                    Subquery(
                        compatible_tasks.filter(
                            spectrogram_id=OuterRef("id"),
                            status=AnnotationTask.Status.FINISHED,
                        )
                    )
                )
            )
        if self.data.get("has_annotations") is not None:
            if self.data.get("has_annotations"):
                queryset = queryset.filter(Exists(Subquery(compatible_annotations)))
            else:
                queryset = queryset.filter(~Exists(Subquery(compatible_annotations)))
        if self.data.get("annotated_by_annotator"):
            queryset = queryset.filter(
                Exists(
                    Subquery(
                        compatible_annotations.filter(
                            annotator_id=OuterRef("annotated_by_annotator"),
                        )
                    )
                )
            )
        if self.data.get("annotated_by_detector"):
            queryset = queryset.filter(
                Exists(
                    Subquery(
                        compatible_annotations.filter(
                            detector_configuration__detector_id=OuterRef(
                                "annotated_by_detector"
                            ),
                        )
                    )
                )
            )
        if self.data.get("annotated_with_label"):
            queryset = queryset.filter(
                Exists(
                    Subquery(
                        compatible_annotations.filter(
                            label__id=OuterRef("annotated_with_label"),
                        )
                    )
                )
            )
        if self.data.get("annotated_with_confidence"):
            queryset = queryset.filter(
                Exists(
                    Subquery(
                        compatible_annotations.filter(
                            confidence__id=OuterRef("annotated_with_confidence"),
                        )
                    )
                )
            )
        if self.data.get("annotated_with_features") is not None:
            f = Q(acoustic_features__isnull=self.data.get("annotated_with_features"))
            if self.data.get("annotated_with_features"):
                queryset = queryset.filter(
                    ~Exists(Subquery(compatible_annotations.filter(f)))
                )
            else:
                queryset = queryset.filter(
                    Exists(Subquery(compatible_annotations.filter(f)))
                )

        queryset = queryset.filter(
            Exists(
                Subquery(
                    compatible_file_ranges.filter(
                        from_datetime__lte=OuterRef("start"),
                        to_datetime__gte=OuterRef("end"),
                    )
                )
            )
        )

        return super().filter_queryset(queryset)
