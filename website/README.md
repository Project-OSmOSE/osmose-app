# OSmOSE showcase website

OSmOSE stands for Open Science meets Ocean Sounds Explorers.
This repository contains the showcase website of the association.

## Installation / development

```sh
# Install the modules from the package.json file
npm install
# Run development server
npm start
# Run test suite
npm test
# Run Storybook
npm run storybook
```

All the files (components and stories) under `src/stories` were created by Storybook and are temporarly kept to be used as examples for stories creation. More data about Storybook in the dedicated [storybook internal documentation](docs/storybook.md).

## Libraries used

The site was bootstrapped with:

* [Create React App](https://github.com/facebook/create-react-app) **with TypeScript enabled**. You can see the dedicated [React page](docs/react.md) in the internal documentation.
* [Storybook](https://storybook.js.org/). You can see the dedicated [Storybook page](docs/storybook.md) in the internal documentation.

Boostrap history:

```sh
npx create-react-app --template typescript osmose-website
npx -p @storybook/cli sb init
npm install --save react-router-dom
npm install --save-dev @types/react-router-dom
```
