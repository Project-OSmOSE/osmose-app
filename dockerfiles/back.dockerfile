# Back dockerfile
FROM python:3.9-slim

WORKDIR /opt

RUN mkdir -p staticfiles

RUN pip install --no-cache-dir  poetry

COPY pyproject.toml .
COPY poetry.lock .

ENV POETRY_CACHE_DIR=/opt/.cache/pypoetry
RUN poetry install --only main

COPY manage.py .
COPY backend backend

RUN chmod -R o+rw .

EXPOSE 8000

CMD ["backend/start.sh"]
