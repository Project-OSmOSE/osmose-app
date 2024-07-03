"""OSmOSE Website - Trap"""
from django.contrib.admin import ModelAdmin, action


class TrapAdmin(ModelAdmin):
    """Trap presentation in DjangoAdmin"""

    list_display = [
        "lastname",
        "firstname",
        "title",
        "intro",
        "date",
        "thumbnail",
    ]

    search_fields = ["title"]
