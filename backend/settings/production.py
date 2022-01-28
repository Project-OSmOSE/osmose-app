"""
Production settings
See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/
"""

import os
import sys

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

# Secure options
DEBUG = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS
# SECURE_SSL_REDIRECT = True
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Prod settings
SECRET_KEY = os.environ["SECRET_KEY"]
ALLOWED_HOSTS = [os.environ["OSMOSE_HOST"]]

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["OSMOSE_DB_BASE"],
        "USER": os.environ["OSMOSE_DB_USER"],
        "PASSWORD": os.environ["OSMOSE_DB_PWD"],
        "HOST": os.environ["OSMOSE_DB_HOST"],
        "PORT": os.environ["OSMOSE_DB_PORT"],
    }
}

# Sentry logging
extra_settings = {}
if "OSMOSE_PROXY_URL" in os.environ:
    extra_settings["http_proxy"] = os.environ["OSMOSE_PROXY_URL"]
# Pylint has a false-positive on sentry use, see https://github.com/getsentry/sentry-python/issues/1081
# pylint: disable-next=abstract-class-instantiated
sentry_sdk.init(
    dsn=os.environ["OSMOSE_SENTRY_URL"],
    integrations=[DjangoIntegration()],
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=1.0,
    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True,
    # Extra settings
    **extra_settings
)

# Logging
LOG_LEVEL = "INFO"
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[%(asctime)s] [%(name)-12s] [%(levelname)-8s] %(message)s",
        },
    },
    "handlers": {
        "console": {
            "level": LOG_LEVEL,
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "verbose",
        },
    },
    "loggers": {
        "": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
    },
}
