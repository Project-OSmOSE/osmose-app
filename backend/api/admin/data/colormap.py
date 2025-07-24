"""API data colormap administration"""
from django.contrib import admin

from backend.api.models import Colormap


@admin.register(Colormap)
class ColormapAdmin(admin.ModelAdmin):
    """Colormap presentation in DjangoAdmin"""

    list_display = (
        "id",
        "name",
    )
