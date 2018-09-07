// LOAD LIBS FOR TESTING

// Load Babel
require('babel-register')();

// Ignore CSS files import for Mocha
require.extensions['.css'] = function () {return null};

// Load Enzyme
require('./loadEnzyme')

// Load JSDom and set it up
// cf https://airbnb.io/enzyme/docs/guides/jsdom.html

const { JSDOM, VirtualConsole } = require('jsdom');

// We want to throw JSDom errors instead of ignoring them
const virtualConsole = new VirtualConsole({ omitJSDOMErrors: true });
virtualConsole.on('jsdomError', err => { throw err });
let jsdomOptions = { url: 'http://localhost/', virtualConsole: virtualConsole };
const jsdom = new JSDOM('<!doctype html><html><body></body></html>', jsdomOptions);
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce((result, prop) => Object.assign(result, {
      [prop]: Object.getOwnPropertyDescriptor(src, prop),
    }), {});
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
copyProps(window, global);

// Let's set the ENV vars
process.env.REACT_APP_API_URL = 'http://test.ode'; // This should be just a hostname for nock

// Let's change how we process unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  // Let's ignore promises with unhandled rejections if the reason in jsdom 'not implemented'
  if (reason.type !== 'not implemented') {
    // Otherwise let's get more helpful info than default node message
    console.log('Unhandled Rejection at: ', promise, 'reason:', reason);
  }
});
