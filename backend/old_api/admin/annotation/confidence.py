"""Admin for confidence indicators"""
from django.contrib import admin, messages
from django.db import IntegrityError, transaction
from django.utils.safestring import mark_safe

from backend.api.models import (
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
    ConfidenceIndicatorSetIndicator,
)


@admin.register(ConfidenceIndicator)
class ConfidenceIndicatorAdmin(admin.ModelAdmin):
    """ConfidenceIndicator presentation in DjangoAdmin"""

    list_display = (
        "id",
        "label",
        "level",
    )

    def save_model(self, request, obj, form, change):
        try:
            with transaction.atomic():
                super().save_model(request, obj, form, change)
        except IntegrityError as error:
            messages.set_level(request, messages.ERROR)
            messages.error(request, error)


class ConfidenceRelationInline(admin.TabularInline):
    """Confidence entry with relation related fields"""

    model = ConfidenceIndicatorSetIndicator


@admin.register(ConfidenceIndicatorSet)
class ConfidenceIndicatorSetAdmin(admin.ModelAdmin):
    """ConfidenceIndicatorSet presentation in DjangoAdmin"""

    list_display = ("id", "name", "desc", "get_indicators")
    inlines = (ConfidenceRelationInline,)

    @admin.display(description="Indicators")
    def get_indicators(self, confidence_set: ConfidenceIndicatorSet):
        """Get indicators"""
        array = []
        relation: ConfidenceIndicatorSetIndicator
        for relation in confidence_set.indicator_relations.all():
            if relation.is_default:
                array.append(f"<b>{relation.confidence_indicator.label}</b>")
            else:
                array.append(relation.confidence_indicator.label)

        return mark_safe(", ".join(array))
