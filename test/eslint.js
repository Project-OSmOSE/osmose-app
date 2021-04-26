let lint = require('mocha-eslint');

let paths = [
  'src/**/*.js'
];

let options = {
    formatter: 'compact',
    alwaysWarn: false,
    timeout: 1000,
    slow: 200,
    strict: true,
    contextName: 'eslint'
};

// Run the tests
lint(paths, options);
