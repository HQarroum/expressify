/**
 * Expressify library entry point.
 */
 (function (name, definition) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['./client', './server'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('./client'), require('./server'));
    } else {
        const gl       = this;
        const instance = definition(gl.ExpressifyClient, gl.ExpressifyServer);
        const old      = gl[name];

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
  return { Client, Server };
 });

