"""OSmOSE Website - Collaborator"""
from django.contrib.admin import ModelAdmin, action


@action(description="Show selected collaborators on HomePage")
# pylint: disable-next=unused-argument
def show_on_home_page(model_admin, request, queryset):
    """Show selected collaborators on HomePage"""
    queryset.update(show_on_home_page=True)


@action(description="Hide selected collaborators on HomePage")
# pylint: disable-next=unused-argument
def hide_on_home_page(model_admin, request, queryset):
    """Hide selected collaborators on HomePage"""
    queryset.update(show_on_home_page=False)


class CollaboratorAdmin(ModelAdmin):
    """Collaborator presentation in DjangoAdmin"""

    list_display = ["name", "level", "show_on_home_page"]
    search_fields = ["name"]
    fields = [
        "name",
        "thumbnail",
        "level",
        "show_on_home_page",
    ]
    actions = [show_on_home_page, hide_on_home_page]
