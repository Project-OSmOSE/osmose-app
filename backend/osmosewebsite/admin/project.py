"""OSmOSE Website - Projects"""
from django.contrib import admin
from django.contrib.admin import ModelAdmin

from backend.osmosewebsite.models import Project


@admin.register(Project)
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
        "osmose_member_contacts",
        "other_contacts",
        "collaborators",
        "thumbnail",
        "metadatax_project",
    ]
