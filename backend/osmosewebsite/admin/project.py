"""OSmOSE Website - Projects"""
from django.contrib.admin import ModelAdmin


class ProjectAdmin(ModelAdmin):
    """Projects presentation in DjangoAdmin"""

    list_display = ("title", "intro", "start", "end")
    search_fields = ["title"]
    fields = [
        "title",
        "start",
        "end",
        "intro",
        "body",
        "contact",
        "collaborators",
        "thumbnail",
    ]
