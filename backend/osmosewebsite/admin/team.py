from django.contrib.admin import ModelAdmin


class TeamMemberAdmin(ModelAdmin):
    """TeamMember presentation in DjangoAdmin"""

    list_display = [
        'name',
        'position',
        'mailAddress'
    ]
    search_fields = ['name']
    fieldsets = [
        (None, {"fields": ["name", "position", "mailAddress", "picture", "biography"]}),
        ("Links", {
            "fields": ["researchGateURL", "personalWebsiteURL", "githubURL", "linkedinURL"]
        })
    ]
