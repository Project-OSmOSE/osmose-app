import sqlparse
from django.apps import apps
from django.db import connection
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class SQLPagination(PageNumberPagination):
    """Custom pagination for SQL query results"""

    page_size = 10
    page_query_param = "page"
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data, columns):
        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
                "columns": columns,
            }
        )


class SqlViewSet(viewsets.ViewSet):
    """SQL related requests"""

    @action(detail=False, methods=["GET"])
    def schema(self, request):
        """Get database schema"""
        tables = dict(
            [
                [
                    model._meta.db_table,
                    [field.attname for field in model._meta.fields],
                ]
                for model in apps.get_models()
            ]
        )
        return Response(tables)

    @action(detail=False, methods=["POST"])
    def post(self, request):
        """Handle user SQL queries"""
        if self.request.user is None:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if not self.request.user.is_superuser:
            return
        user_query = request.data.get("query")
        columns = []
        queryset = None
        if user_query:
            with connection.cursor() as cursor:
                cursor.execute("SET default_transaction_read_only = true;")
                try:
                    # only allow SELECT queries to be run. it will also allow (with CTEs)
                    parsed_statement = sqlparse.parse(user_query)
                    for statement in parsed_statement:
                        if statement.get_type() != "SELECT":
                            raise Exception(
                                "Invalid query! Only select statements are allowed"
                            )
                    # execute SQL with cursor
                    cursor.execute(user_query)
                    columns = [col[0] for col in cursor.description]
                    queryset = cursor.fetchall()
                except Exception as e:
                    print("post exception", e)
                    return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

        paginator = SQLPagination()
        paginated_rows = paginator.paginate_queryset(queryset, self.request)
        return paginator.get_paginated_response(paginated_rows, columns)
