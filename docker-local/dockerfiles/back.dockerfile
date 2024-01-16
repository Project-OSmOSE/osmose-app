# Back dockerfile
FROM python:3.9-slim

WORKDIR /opt

RUN mkdir -p staticfiles

RUN pip install --no-cache-dir  poetry

ENV POETRY_CACHE_DIR=/opt/.cache/pypoetry
#RUN poetry install

ENV ENV=build
#RUN poetry run python manage.py collectstatic --noinput
#RUN poetry run manage.py migrate
#RUN poetry run manage.py seed

EXPOSE 8000

#RUN #poetry run manage.py runserver 8000
