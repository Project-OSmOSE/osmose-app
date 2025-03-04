"""User-related admin"""
from typing import Optional

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from backend.api.admin import get_many_to_many
from backend.aplose.models import AploseUser, User, ExpertiseLevel, AnnotatorGroup


class AploseUserInline(admin.StackedInline):
    """Aplose specific administration config for User"""

    model = AploseUser
    can_delete = False


class UserAdmin(BaseUserAdmin):
    """User admin including Aplose specific config"""

    inlines = [AploseUserInline]

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "expertise_level",
    )

    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "groups",
        "aplose__expertise_level",
    )

    @admin.display(description="Expertise level")
    def expertise_level(self, obj: User) -> Optional[str]:
        """Display expertise level"""
        if obj.aplose.expertise_level:
            return ExpertiseLevel(obj.aplose.expertise_level).label
        return None


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(AnnotatorGroup)
class AnnotatorGroupAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "show_annotators",
    )
    search_fields = (
        "name",
        "annotators__username",
        "annotators__first_name",
        "annotators__last_name",
    )
    filter_horizontal = ("annotators",)

    @admin.display(description="Annotators")
    def show_annotators(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "annotators", "username")
