""" APLOSE SQL Routing"""
from rest_framework import routers

from backend.sql.views import SqlViewSet

# SQL urls are meant to be used by our React frontend
sql_router = routers.DefaultRouter()
sql_router.register(r"sql", SqlViewSet, basename="sql")
