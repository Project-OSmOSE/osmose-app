"""API common archive administration"""
from django.contrib import admin

from backend.api.models import Archive


@admin.register(Archive)
class ArchiveAdmin(admin.ModelAdmin):
    """Archive presentation in DjangoAdmin"""

    list_display = ("id", "date", "by_user")


class IsArchivedFilter(admin.SimpleListFilter):
    """Filter archived items"""

    title = "Is archived"
    parameter_name = "is_archived"

    def lookups(self, request, model_admin):
        return (
            ("Yes", "Yes"),
            ("No", "No"),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == "Yes":
            return queryset.filter(archive__isnull=False)
        if value == "No":
            return queryset.filter(archive__isnull=True)
        return queryset
