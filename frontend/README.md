# FrontApp [![Build Status](https://travis-ci.org/Project-ODE/FrontApp.svg?branch=master)](https://travis-ci.org/Project-ODE/FrontApp)

Front-end Application sourcing data from FeatureService. It is a React application meant to manage datasets, launch annotation campaigns and annotate dataset files.

For more information about what the application can do or how to use the annotator, see the [user guide](docs/user_guide_annotator.md).

## Installation

```sh
npm install
```

### Create a config env file:

```sh
echo "REACT_APP_API_URL=http://localhost:7231/data.ode.org/v1" > .env.development.local
```

### Setting up development environment:

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

## Inspired by CrowdCurio

This project started as a wrapper around [CrowdCurio annotator](https://github.com/CrowdCurio/audio-annotator). As our use case diverged we decided to restart from scratch, using CrowdCurio as inspiration. Some features are still missing: waveform representation of the audio file, [user feedback](https://github.com/CrowdCurio/audio-annotator#feedback-mechanisms) through test audio files (that already has reference annotations), and advanced tracking of user actions (deleted_annotations and annotation_events: `start-to-create`, `offline-create`, `add-annoation-label`, `add-proxity-label`, `delete`, `play-region`, `select-for-edit`, `region-moved-end`, `region-moved-start`).
