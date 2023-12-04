"""Pagination"""
from rest_framework.pagination import PageNumberPagination


class OsmosePagination(PageNumberPagination):
    """Custom pagination to allow the front to select the page size"""

    page_size_query_param = "page_size"
