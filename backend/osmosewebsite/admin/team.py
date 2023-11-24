from django.contrib.admin import ModelAdmin, action


@action(description="Mark selected members as former members")
def make_former(modelAdmin, request, queryset):
    queryset.update(isFormerMember=True)


class TeamMemberAdmin(ModelAdmin):
    """TeamMember presentation in DjangoAdmin"""

    list_display = [
        'name',
        'position',
        'mailAddress',
        'isFormerMember'
    ]
    search_fields = ['name']
    fieldsets = [
        (None, {"fields": ["name", "position", "mailAddress", "picture", "biography", "isFormerMember"]}),
        ("Links", {
            "fields": ["researchGateURL", "personalWebsiteURL", "githubURL", "linkedinURL"]
        })
    ]
    actions = [make_former]
