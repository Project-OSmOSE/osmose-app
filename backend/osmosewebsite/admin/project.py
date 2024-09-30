"""OSmOSE Website - Projects"""
from django.contrib.admin import ModelAdmin


class ProjectAdmin(ModelAdmin):
    """Projects presentation in DjangoAdmin"""

    list_display = ("title", "intro", "start", "end", "metadatax_project")
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
        "metadatax_project",
    ]
