# OsmoseApp

[![Continuous integration][ci-badge]][ci-link]
[![Code style: black][black-badge]][black-link]
[![][coverage-badge]][coverage-link]

[ci-badge]: https://github.com/Project-OSmOSE/osmose-app/actions/workflows/continuous-integration.yml/badge.svg
[ci-link]: https://github.com/Project-OSmOSE/osmose-app/actions/workflows/continuous-integration.yml
[black-badge]: https://img.shields.io/badge/code%20style-black-000000.svg
[black-link]: https://github.com/psf/black
[coverage-badge]: https://Project-OSmOSE.github.io/osmose-app/coverage/badge.svg
[coverage-link]: https://Project-OSmOSE.github.io/osmose-app/coverage

In this repository there are actually 2 projets : APLOSE software and OSmOSE team's website.
The backend is shared by the 2 projects but is located in distincts Django apps.

### APLOSE
APLOSE is a scalable web-based annotation tool for marine bioacoustics.
It allows the annotations of audio spectrograms. It is currently used for
marine bioacoustics studies but its usage can be extended to all kind of
acousitc studies.

APLOSE is composed of a React frontend, located in "frontend" folder, and
a Django backend, located in the "backend" folder ("api" app).

### OSmOSE team's website
OSmOSE team's website is composed of a React frontend, located in "website" folder, and
a Django backend, located in the "backend" folder ("osmosewebsite" app).

---

## Deployment

For Ifremer infrastructure follow the comments in the .gitlab-ci.yml file, otherwise use the docker-compose.yml file (you should create a .env file with the required variables, see [possible variables](#possible-env-variable)).

## Development

This project uses poetry (`pip install poetry`) for Python dev and npm for Javascript dev.

### Setup

**Backend:**

```bash
# Initial setup
poetry install
docker run --name devdb -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:5432:5432 -d postgis/postgis
docker start devdb
poetry run ./manage.py migrate
poetry run ./manage.py seed

# Run
docker start devdb
poetry run ./manage.py runserver
```

**Frontend:**

```bash
# Initial setup
cd frontend
npm install
# Run
npm run dev
```

### Testing

```bash
# Run backend & frontend tests
docker start devdb
poetry run ./manage.py test
cd frontend; npm test

# Run backend coverage
coverage run ./manage.py test && coverage report
# You can also get an html report in the htmlcov folder
coverage html
```

#### Cypress testing

We use [Cypress](https://docs.cypress.io) for end to end testing. Examples of cypress tests are kept in `frontend/cypress/examples`, they should be deleted once we have a solid E2E test base.

```bash
cd frontend
# Run Cypress test runner
./node_modules/.bin/cypress open
```

### Before pushing to github

```bash
# Be sure not to forget any migrations
poetry run ./manage.py makemigrations
# You should run Pylint regularly when coding to get tips and avoid bad patterns
poetry run pylint backend
# Also don't forget to use black in order to unify code style
poetry run black backend
```

### Tooling & maintenance

To update a package to a specific version do not directly edit the pyproject.toml file but rather use the following command:
```bash
poetry add --group dev "pylint==2.14.5"
```
Here `--group dev` because this is a dev tool, if it's a library to also be used in production you can drop that option.

If you want to changes pylint rules, the configuration options are in the `pyproject.toml` file.

**Formatting :**

If you use VSCode, you can add `"python.formatting.provider": "black"` to your .vscode/settings.json

### Possible .env variable

```
ENV=                # either "development" or "production", used for backend.api.settings
STAGING=            # "true" if we are in staging, used in backend/start.sh to install dev libraries
SECRET_KEY=         # see https://docs.djangoproject.com/en/3.2/ref/settings/#secret-key
OSMOSE_HOST=        # "osmose.ifremer.fr" for production, use what you want for staging and localhost
OSMOSE_DB_USER=     # database username
OSMOSE_DB_PWD=      # database password
HTTPS_PORTAL_STAGE= # see https://github.com/SteveLTN/https-portal, use "local" to test on your machine
OSMOSE_SENTRY_URL=  # if you use https://sentry.io (more for staging and production)

DJANGO_ADMIN_USERNAME=  # Username for your Django superadmin user
DJANGO_ADMIN_EMAIL=     # Email address of your Django superadmin user (for now there is no real use of it)
DJANGO_ADMIN_PASSWORD=  # Password for your Django superadmin user
```
