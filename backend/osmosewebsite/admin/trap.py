"""OSmOSE Website - Trap"""
from django.contrib.admin import ModelAdmin


class TrapAdmin(ModelAdmin):
    """Trap presentation in DjangoAdmin"""

    list_display = [
        "title",
        "presenter_name",
        "intro",
        "date",
        "thumbnail",
    ]

    search_fields = ["title", "presenter_name"]

    fieldsets = [
        (
            None,
            {
                "fields": [
                    "title",
                    "date",
                    "intro",
                    "thumbnail",
                ]
            },
        ),
        (
            "Presenter",
            {
                "fields": [
                    "presenter_name",
                    "presenter_linkedin_url",
                    "presenter_mail_address",
                    "presenter_research_gate_url",
                ]
            },
        ),
    ]
