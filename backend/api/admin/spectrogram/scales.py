"""Spectrogram scales admin configuration"""
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from backend.api.models import LinearScale, MultiLinearScale


@admin.register(LinearScale)
class LinearScaleAdmin(admin.ModelAdmin):
    """LinearScale presentation in DjangoAdmin"""

    list_display = (
        "name",
        "ratio",
        "min_value",
        "max_value",
    )


@admin.register(MultiLinearScale)
class MultiLinearScaleAdmin(admin.ModelAdmin):
    """MultiLinearScale presentation in DjangoAdmin"""

    list_display = (
        "name",
        "inner_scales_links",
    )

    @admin.display(description="Inner scales")
    def inner_scales_links(self, obj: MultiLinearScale) -> str:
        """Get direct link to inner scales"""
        links = []
        for scale in obj.inner_scales.all():
            link = reverse("admin:api_linearscale_change", args=[scale.id])
            links.append(format_html('<a href="{}">{}</a>', link, scale))
        return format_html("<br>".join(links))
