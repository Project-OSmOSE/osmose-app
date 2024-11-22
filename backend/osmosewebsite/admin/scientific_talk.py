"""OSmOSE Website - ScientificTalk"""
from django.contrib import admin

from backend.osmosewebsite.models import ScientificTalk


@admin.register(ScientificTalk)
class ScientificTalkAdmin(admin.ModelAdmin):
    """ScientificTalk presentation in DjangoAdmin"""

    list_display = [
        "title",
        "intro",
        "date",
        "thumbnail",
    ]
    search_fields = [
        "title",
    ]
    fields = [
        "title",
        "date",
        "intro",
        "thumbnail",
        "osmose_member_presenters",
        "other_presenters",
    ]
