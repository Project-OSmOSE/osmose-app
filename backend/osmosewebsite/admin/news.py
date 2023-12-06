"""OSmOSE Website - News"""
from django.contrib.admin import ModelAdmin


class NewsAdmin(ModelAdmin):
    """News presentation in DjangoAdmin"""

    list_display = ("title", "intro", "date", "thumbnail")
    search_fields = ["title"]
