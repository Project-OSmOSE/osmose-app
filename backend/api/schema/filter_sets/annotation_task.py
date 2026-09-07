from django.db.models import QuerySet, Exists, Subquery, OuterRef
from django_extension.filters import ExtendedFilterSet, IDFilter
from django_filters import BooleanFilter, CharFilter, OrderingFilter

from backend.api.models import AnnotationTask, Annotation


class AnnotationTaskFilterSet(ExtendedFilterSet):
    """Annotation filters"""

    annotations__exists = BooleanFilter(method="fake_filter")
    annotations__confidence = CharFilter(method="fake_filter")
    annotations__label = CharFilter(method="fake_filter")
    annotations__acoustic_features__exists = BooleanFilter(method="fake_filter")
    annotations__detector = IDFilter(method="fake_filter")
    annotations__annotator = IDFilter(method="fake_filter")

    class Meta:
        model = AnnotationTask
        fields = {
            "annotator": ("exact",),
            "status": ("exact",),
            "spectrogram__filename": ("icontains",),
            "spectrogram__start": ("lte",),
            "spectrogram__end": ("gte",),
        }

    order_by = OrderingFilter(fields=(("start", "start"),))

    def fake_filter(self, queryset, name, value):
        """Fake filter method - Filter is directly used in the filter_queryset method"""
        return queryset

    def filter_queryset(self, queryset: QuerySet[AnnotationTask]):

        if self.data.get("annotations__exists") is not None:
            compatible_annotations = Annotation.objects.all()

            if self.data.get("annotations__label"):
                compatible_annotations = compatible_annotations.filter(
                    label__id=self.data.get("annotations__label")
                )
            if self.data.get("annotations__confidence"):
                compatible_annotations = compatible_annotations.filter(
                    confidence__id=self.data.get("annotations__confidence")
                )
            if self.data.get("annotations__acoustic_features__exists"):
                compatible_annotations = compatible_annotations.filter(
                    acoustic_features__isnull=not self.data.get(
                        "annotations__acoustic_features__exists"
                    )
                )
            if self.data.get("annotations__detector"):
                compatible_annotations = compatible_annotations.filter(
                    detector_configuration__detector_id=self.data.get(
                        "annotations__detector"
                    )
                )
            if self.data.get("annotations__annotator"):
                compatible_annotations = compatible_annotations.filter(
                    annotator_id=self.data.get("annotations__annotator")
                )

            f = Exists(
                Subquery(
                    compatible_annotations.filter(
                        annotation_phase_id=OuterRef("annotation_phase_id"),
                        spectrogram_id=OuterRef("spectrogram_id"),
                    )
                )
            )
            if self.data.get("annotations__exists"):
                queryset = queryset.filter(f)
            else:
                queryset = queryset.filter(~f)

        return super().filter_queryset(queryset)
