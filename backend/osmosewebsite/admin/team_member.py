"""OSmOSE Website - Team Member"""
from django.contrib import admin

from backend.api.admin import get_many_to_many
from backend.osmosewebsite.models import TeamMember


@admin.action(description="Mark selected members as former members")
# pylint: disable-next=unused-argument
def make_former(model_admin, request, queryset):
    """TeamMember admin action to make it a former member"""
    queryset.update(is_former_member=True)


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    """TeamMember presentation in DjangoAdmin"""

    list_display = [
        "__str__",
        "show_institutions",
        "position",
        "is_former_member",
        "level",
    ]
    search_fields = ["scientist__first_name", "scientist__last_name"]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "scientist",
                    "position",
                    "picture",
                    "biography",
                    "is_former_member",
                    "level",
                ]
            },
        ),
        (
            "Email & Links",
            {
                "fields": [
                    "mail_address",
                    "personal_website_url",
                    "research_gate_url",
                    "github_url",
                    "linkedin_url",
                ]
            },
        ),
    ]
    actions = [make_former]

    @admin.display(description="Institutions")
    def show_institutions(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj.scientist, "institutions", "name")
