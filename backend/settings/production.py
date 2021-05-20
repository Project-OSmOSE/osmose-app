"""
Production settings
See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/
"""

import os
import sys

# Secure options
DEBUG = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS
# SECURE_SSL_REDIRECT = True
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Prod settings
SECRET_KEY = os.environ['SECRET_KEY']
ALLOWED_HOSTS = [os.environ['OSMOSE_HOST']]

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['OSMOSE_DB_BASE'],
        'USER': os.environ['OSMOSE_DB_USER'],
        'PASSWORD': os.environ['OSMOSE_DB_PWD'],
        'HOST': os.environ['OSMOSE_DB_HOST'],
        'PORT': os.environ['OSMOSE_DB_PORT'],
    }
}

# Logging
LOG_LEVEL = 'INFO'
LOGGING = {
   'version': 1,
   'disable_existing_loggers': False,
   'formatters': {
       'verbose': {
           'format': '[%(asctime)s] [%(name)-12s] [%(levelname)-8s] %(message)s',
       },
   },
   'handlers': {
       'console': {
           'level': LOG_LEVEL,
           'class': 'logging.StreamHandler',
           'stream': sys.stdout,
           'formatter': 'verbose'
       },
   },
   'loggers': {
       '': {
           'handlers': ['console'],
           'level': LOG_LEVEL,
           'propagate': True,
       },
   },
}
