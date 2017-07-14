/**
 * Exporting the `Request` module appropriately given
 * the environment (AMD, Node.js and the browser).
 */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['./lib/client', './lib/server'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('./lib/client'), require('./lib/server'));
    } else {
        var gl       = this;
        var instance = definition(gl.ExpressifyClient, gl.ExpressifyServer);
        var old      = gl[name];

        /**
         * Allowing to scope the module
         * avoiding global namespace pollution.
         */
        instance.noConflict = function () {
            gl[name] = old;
            return instance;
        };
        // Exporting the module in the global
        // namespace in a browser context.
        gl[name] = instance;
    }
 })('Expressify', function (Client, Server) {
  return {
    Client: Client,
    Server: Server
  };
 });

