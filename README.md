# OsmoseApp

[![Continuous integration][ci-badge]][ci-link]
[![Code style: black][black-badge]][black-link]
[![][coverage-badge]][coverage-link]

[ci-badge]: https://github.com/Project-ODE/osmose-app/actions/workflows/continuous-integration.yml/badge.svg
[ci-link]: https://github.com/Project-ODE/osmose-app/actions/workflows/continuous-integration.yml
[black-badge]: https://img.shields.io/badge/code%20style-black-000000.svg
[black-link]: https://github.com/psf/black
[coverage-badge]: https://project-ode.github.io/osmose-app/coverage/badge.svg
[coverage-link]: https://project-ode.github.io/osmose-app/coverage

## Deployment

For Ifremer infrastructure follow the comments in the .gitlab-ci.yml file, otherwise use the docker-compose.yml file (you should create a .env file with the required variables).

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
