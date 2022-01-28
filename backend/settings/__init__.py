"""
Django settings for OSMOSE project.
"""

import os

from .base import *

if os.environ.get("ENV") == "production":
    from .production import *
else:
    from .development import *
