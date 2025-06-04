"""OSmOSE Website - Scientist"""
from django.contrib import admin

from backend.api.admin import get_many_to_many
from backend.osmosewebsite.models import Scientist, Institution


@admin.register(Scientist)
class ScientistAdmin(admin.ModelAdmin):
    """Scientist presentation in DjangoAdmin"""

    list_display = ["first_name", "last_name", "show_institutions"]
    search_fields = ["first_name", "last_name", "institutions__name"]
    filter_horizontal = ("institutions",)

    @admin.display(description="Institutions")
    def show_institutions(self, obj):
        """show_spectro_configs"""
        return get_many_to_many(obj, "institutions", "name")


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    """Institution presentation in DjangoAdmin"""

    list_display = [
        "name",
        "city",
        "country",
    ]
    search_fields = ["name", "city", "country"]
