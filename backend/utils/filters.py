"""Util filters"""
from django.core.exceptions import FieldError
from rest_framework import filters
from rest_framework.request import Request


class ModelFilter(filters.BaseFilterBackend):
    """Common filter for model viewsets"""

    def filter_queryset(self, request: Request, queryset, view):
        _queryset = queryset
        for param in request.query_params:
            try:
                _queryset = _queryset.filter(**{param: request.query_params[param]})
            except FieldError:
                continue
        return _queryset
