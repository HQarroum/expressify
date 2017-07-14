/**
 * Base configuration for RequireJS.
 */
requirejs.config({
  baseUrl: './',
  paths: {
    'jquery': 'assets/components/jquery/dist/jquery.min',
    'lodash': 'assets/components/lodash/dist/lodash.min',
    'bootstrap': 'assets/components/bootstrap/dist/js/bootstrap.min',
    'middleware-chain': 'assets/components/middleware-chain/dist/middleware-chain.min',
    'timed-cache': 'assets/components/timed-cache/cache',
    'expressify': 'assets/components/expressify/index',
    'Joi': 'assets/components/joi-browser/dist/joi-browser.min',
    'prism': 'assets/components/prism/prism'
  },
  shim: {
    bootstrap: {
      deps: ['jquery']
    },
    prism: {
      exports: 'Prism'
    }
  }
});

/**
 * It is required to define `global` for `Joi`.
 */
if (typeof global === 'undefined') {
  global = window;
}

/**
 * Requiring application dependencies.
 */
define(['jquery', 'prism', 'bootstrap']);