from django.db.models import QuerySet, Q, Exists, OuterRef
from django_extension.filters import ExtendedFilterSet, IDFilter
from django_filters import BooleanFilter

from backend.api.models import Annotation, AnnotationValidation


class AnnotationFilterSet(ExtendedFilterSet):
    """Annotation filters"""

    acoustic_features__exists = BooleanFilter(
        field_name="acoustic_features", lookup_expr="isnull", exclude=True
    )
    is_validated_by = IDFilter(method="filter_is_validated_by")
    is_updated = BooleanFilter(method="fake")
    annotator = IDFilter(method="fake")

    class Meta:
        model = Annotation
        fields = {
            "confidence": ("exact",),
            "label": ("exact",),
            "detector_configuration__detector": ("exact",),
        }

    def filter_is_validated_by(self, queryset, name, value):
        """Filter on validated annotation"""
        return queryset.filter(
            Q(annotator_id=value)
            | Exists(
                AnnotationValidation.objects.filter(
                    annotator_id=value,
                    is_valid=True,
                    annotation_id=OuterRef("pk"),
                )
            )
        )

    def fake(self, queryset, name, value):
        """Fake filter method - Filter is directly used in the filter_queryset method"""
        return queryset

    def filter_queryset(self, queryset: QuerySet[Annotation]):
        annotator_id = self.data.get("annotator")
        if annotator_id:
            queryset = queryset.filter(annotator_id=annotator_id)
            if self.data.get("is_updated") is True:
                queryset = queryset.filter(updated_to__annotator_id=annotator_id)
            elif self.data.get("is_updated") is False:
                queryset = queryset.filter(~Q(updated_to__annotator_id=annotator_id))

        return super().filter_queryset(queryset)
