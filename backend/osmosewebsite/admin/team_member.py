"""OSmOSE Website - Team Member"""
from django.contrib.admin import ModelAdmin, action


@action(description="Mark selected members as former members")
# pylint: disable-next=unused-argument
def make_former(model_admin, request, queryset):
    """TeamMember admin action to make it a former member"""
    queryset.update(isFormerMember=True)


class TeamMemberAdmin(ModelAdmin):
    """TeamMember presentation in DjangoAdmin"""

    list_display = ["name", "position", "mailAddress", "isFormerMember", "level"]
    search_fields = ["name"]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "name",
                    "position",
                    "mailAddress",
                    "picture",
                    "biography",
                    "isFormerMember",
                    "level",
                ]
            },
        ),
        (
            "Links",
            {
                "fields": [
                    "researchGateURL",
                    "personalWebsiteURL",
                    "githubURL",
                    "linkedinURL",
                ]
            },
        ),
    ]
    actions = [make_former]
