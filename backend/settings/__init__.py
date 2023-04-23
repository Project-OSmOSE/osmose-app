"""
Django settings for OSMOSE project.
"""

import os

from .base import *

if os.environ.get("ENV") == "production":
    from .production import *
else:
    from .development import *

    # Use django-debug-toolbar for SQL insights
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]
