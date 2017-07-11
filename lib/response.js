 /**
  * Exporting the `Response` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['lodash'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('lodash'));
    } else {
        var gl       = this;
        var instance = definition(gl._);
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
 })('Response', function (_) {

  /**
   * A string representation of a randomly
   * created GUID.
   */
  var guid = function () {
    var s4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  var Response = function (app, e) {
    this.app           = app;
    this.code          = e.code;
    this.headers       = e.headers || {};
    this.payload       = e.payload || {};
    this.transactionId = e.transactionId;
    this.type          = 'response';
  };

  Response.fromEvent = function (app, e) {
    return new Response(app, {
      app: app,
      code: e.data.code,
      headers: e.data.headers,
      payload: e.data.payload,
      transactionId: e.data.transactionId
    });
  };

  Response.fromRequest = function (app, req) {
    return new Response(app, {
      app: app,
      code: 200,
      transactionId: req.data.transactionId
    });
  };

  Response.prototype.send = function (code, data) {
    this.code = code;
    if (data) {
      this.payload = data;
    }
    this.app.connection.postMessage(_.pick(this, [
      'code',
      'headers',
      'payload',
      'transactionId',
      'type'
    ]), '*');
  };

  return (Response);
 });