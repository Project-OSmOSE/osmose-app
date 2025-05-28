"""OSmOSE Website - Collaborator"""
from django.contrib import admin

from backend.osmosewebsite.models import Bibliography, Author


class AuthorInline(admin.TabularInline):
    """Tabular for authors"""

    extra = 0
    model = Author
    classes = ["collapse"]


@admin.register(Bibliography)
class BibliographyAdmin(admin.ModelAdmin):
    """Collaborator presentation in DjangoAdmin"""

    list_display = ["title", "doi", "publication", "type"]
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
    inlines = [
        AuthorInline,
    ]
