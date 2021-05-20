#!/bin/bash

poetry run python manage.py collectstatic --noinput
poetry run python manage.py migrate
poetry run python manage.py seed --init-only
poetry run gunicorn -b 0.0.0.0:8000 backend.wsgi
