"""OSmOSE Website - Team Member"""
from django.contrib.admin import ModelAdmin, action


@action(description="Mark selected members as former members")
# pylint: disable-next=unused-argument
def make_former(model_admin, request, queryset):
    """TeamMember admin action to make it a former member"""
    queryset.update(is_former_member=True)


class TeamMemberAdmin(ModelAdmin):
    """TeamMember presentation in DjangoAdmin"""

    list_display = [
        "lastname",
        "firstname",
        "position",
        "is_former_member",
        "level",
    ]
    search_fields = ["lastname", "firstname"]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "lastname",
                    "firstname",
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
