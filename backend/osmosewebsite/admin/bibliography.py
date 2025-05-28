"""OSmOSE Website - Collaborator"""
from django.contrib import admin

from backend.api.admin import get_many_to_many
from backend.osmosewebsite.models import Bibliography, Author
from backend.osmosewebsite.models.bibliography import BibliographyTag


@admin.register(BibliographyTag)
class BibliographyTagAdmin(admin.ModelAdmin):
    """Bibliography Tag Admin"""

    list_display = [
        "name",
    ]
    search_fields = [
        "name",
    ]


class AuthorInline(admin.TabularInline):
    """Tabular for authors"""

    extra = 0
    model = Author
    classes = ["collapse"]


@admin.register(Bibliography)
class BibliographyAdmin(admin.ModelAdmin):
    """Collaborator presentation in DjangoAdmin"""

    list_display = ["title", "doi", "publication", "type", "show_tags"]
    search_fields = [
        "title",
        "doi",
    ]
    fieldsets = [
        [
            None,
            {
                "fields": [
                    "title",
                    "doi",
                    "publication_status",
                    "publication_date",
                    "type",
                    "tags",
                ]
            },
        ],
        [
            "Article",
            {
                "fields": [
                    "journal",
                    "volumes",
                    "pages_from",
                    "pages_to",
                    "issue_nb",
                    "article_nb",
                ],
                "classes": ["collapse"],
            },
        ],
        [
            "Conference",
            {
                "fields": [
                    "conference",
                    "conference_location",
                ],
                "classes": ["collapse"],
            },
        ],
        [
            "Software",
            {
                "fields": [
                    "publication_place",
                    "repository_url",
                ],
                "classes": ["collapse"],
            },
        ],
    ]
    filter_horizontal = ("tags",)
    inlines = [
        AuthorInline,
    ]

    @admin.display(description="Tags")
    def show_tags(self, obj: Bibliography):
        """show_tags"""
        return get_many_to_many(obj, "tags", "name")
