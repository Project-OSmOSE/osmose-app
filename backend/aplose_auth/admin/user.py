"""User-related admin"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from backend.aplose_auth.models import AploseUser, User
from backend.aplose_auth.models.user import ExpertiseLevel


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
    def expertise_level(self, obj: User) -> str:
        """Display expertise level"""
        return ExpertiseLevel(obj.aplose.expertise_level).name


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
