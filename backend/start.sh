#!/bin/bash

# If on staging we want some dev libraries like Faker for seeding
if [ "$STAGING" = "true" ]; then poetry install; fi

# Normal setup commands
poetry run python manage.py collectstatic --noinput
poetry run python manage.py migrate

# Launching server
# Increase the timeout to 120 seconds to handle large CSV files
poetry run gunicorn -b 0.0.0.0:8000 backend.wsgi --timeout 120
