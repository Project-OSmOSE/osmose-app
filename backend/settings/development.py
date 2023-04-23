"""
Quick-start development settings - unsuitable for production
See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/
"""

from datetime import timedelta
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "(7ez_3daj2vkxl+pq8fbk8cav8$y4wrs!(!x(q!ec01iq2k7gl"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "postgres",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "127.0.0.1",
        "PORT": 5432,
    }
}
# You should run docker run --name devdb -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:5432:5432 -d postgis/postgis

# https://django-rest-framework-simplejwt.readthedocs.io/en/latest/settings.html
SIMPLE_JWT = {"ACCESS_TOKEN_LIFETIME": timedelta(hours=8)}

# Override datawork import path, we use the same folder as for docker-compose
DATASET_IMPORT_FOLDER = BASE_DIR / "volumes/datawork/dataset"
# Adding volumes folder to staticfiles dirs
STATICFILES_DIRS = [BASE_DIR / "backend/api/static", BASE_DIR / "volumes"]

# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#configure-internal-ips
if DEBUG:
    import socket  # only if you haven't already imported this

    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS = [ip[: ip.rfind(".")] + ".1" for ip in ips] + [
        "127.0.0.1",
        "10.0.2.2",
    ]
