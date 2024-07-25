"""OSmOSE Website - Trap"""
from django.contrib.admin import ModelAdmin, action


class TrapAdmin(ModelAdmin):
    """Trap presentation in DjangoAdmin"""

    list_display = [
        "title",
        "presenter_lastname",
        "presenter_firstname",
        "intro",
        "date",
        "thumbnail",
    ]

    search_fields = ["title", "presenter_firstname", "presenter_lastname"]
