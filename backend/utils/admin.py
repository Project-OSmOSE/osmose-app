"""Admin util methods"""
from django.db.models import QuerySet
from django.urls import reverse
from django.utils.html import format_html


def get_many_to_many(obj, field_name, related_field_name="name"):
    """List all related field

    Args:
        obj (object): _description_
        field_name (string): _description_
        related_field_name (str, optional): _description_. Defaults to "name".

    Returns:
        string: _description_
    """
    field_name_attr = getattr(obj, field_name)
    many_to_many_attributs = ""
    for one_name_attr in field_name_attr.all().distinct():
        name_field = getattr(one_name_attr, related_field_name)
        many_to_many_attributs += f"{name_field}, "

    return many_to_many_attributs[:-2]


def get_edit_links_for_queryset(queryset: QuerySet, viewname: str):
    """Return list of foreign data"""
    links = []
    for obj in queryset:
        link = reverse(viewname, args=[obj.id])
        links.append(format_html('<a href="{}">{}</a>', link, obj))
    return format_html("<br>".join(links))


def get_edit_link(viewname: str, obj):
    return format_html('<a href="{}">{}</a>', reverse(viewname, args=[obj.id]), obj)
