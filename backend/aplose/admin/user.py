"""User-related admin"""
from typing import Optional

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from backend.aplose.models import AploseUser, User
from backend.aplose.models.user import ExpertiseLevel, Datawork


@admin.register(Datawork)
class DataworkAdmin(admin.ModelAdmin):
    model = Datawork
    list_display = ["name", "folder_name"]
    search_fields = ["name", "folder_name"]


class AploseUserInline(admin.StackedInline):
    """Aplose specific administration config for User"""

    model = AploseUser
    can_delete = False

    filter_horizontal = [
        "allowed_datawork",
    ]


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
        "allowed_datawork",
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

    @admin.display(description="Allowed dataworks")
    def allowed_datawork(self, obj: User) -> Optional[str]:
        """Display expertise level"""
        aplose_user: AploseUser = obj.aplose
        return ", ".join(aplose_user.allowed_datawork.values_list("name", flat=True))


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
