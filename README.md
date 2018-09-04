# FrontApp

Front-end Application sourcing data from FeatureService. It is a React application meant to manage datasets, launch annotation campaigns and annotate dataset files.

## Installation

```sh
npm install
```

### Create a config env file:

```sh
echo "REACT_APP_API_URL=http://localhost:7231/data.ode.org/v1" > .env.development.local
```

### Setting up development environment:

You should have FeatureService set up, you'd typically do it the following way:

```sh
# Install FeatureService if you don't have it already
git clone https://github.com/Project-ODE/FeatureService
# Install needed libraries
cd FeatureService; npm install
# We need to install a patch on hyperswitch to avoid CORS dev problems
curl https://raw.githubusercontent.com/ixio/OdeDocker/master/FeatureService/hyperswitch.patch | patch -p0
# Let's start by running a postgis DB container called testdb, if needed you can delete with "docker rm -f testdb" and re-create it
docker run --name testdb -e POSTGRES_USER=test -p 127.0.0.1:5433:5432 -d mdillon/postgis
# If this the first time postgis is started we need to seed it with knex
NODE_ENV=test knex migrate:latest; NODE_ENV=test knex seed:run
# To use knex like this you need to create an alias "alias knex=node_modules/knex/bin/cli.js" or install it globally with "npm install -g knex"
```

You can then run the following commands any time you need FeatureService:

```sh
# Let's make sure the DB is running
docker start testdb
# We can than start the FeatureService server in test mode (to access the test data)
NODE_ENV=test node server.js -c config.test.yaml
```

## Useful commands:

```sh
npm start
npm test
```
