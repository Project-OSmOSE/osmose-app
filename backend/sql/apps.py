"""SQL app"""
from django.apps import AppConfig


class SqlConfig(AppConfig):
    """SQL app config"""

    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.sql"
