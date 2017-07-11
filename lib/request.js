 /**
  * Exporting the `Request` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['Joi'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('joi'));
    } else {
        var gl       = this;
        var instance = definition(gl.Joi);
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
 })('Request', function (Joi) {

  /**
   * Schema of a request object.
   */
  var schema = Joi.object().keys({
    app: Joi.object().required(),
    path: Joi.string().required(),
    method: Joi.string().required(),
    payload: Joi.object().required(),
    transactionId: Joi.string().required(),
    headers: Joi.object().required(),
    caller: Joi.object().required(),
    type: Joi.string().required()
  }).unknown().required();

  /**
   * Request constructor.
   * @param {*} app 
   * @param {*} e
   */
  var Request = function (app, e) {
    this.app           = app;
    this.event         = e.event;
    this.path          = e.resource;
    this.method        = e.method;
    this.payload       = e.payload || {};
    this.transactionId = e.transactionId;
    this.headers       = e.headers || {};
    this.caller        = e.caller;
    this.type          = 'request';
    Joi.validate(this, schema, function (err) {
      if (err) {
        throw new Error(err);
      }
    });
  };

  /**
   * @return a new request instance built from
   * another request.
   */
  Request.from = function (app, e) {
    return new Request(app, {
      app: app,
      event: e,
      method: e.data.method,
      resource: e.data.resource,
      headers: e.data.headers,
      payload: e.data.payload,
      caller: e.data.caller,
      transactionId: e.data.transactionId
    });
  };

  Request.prototype.get = function (value) {
    return (this.headers[value]);
  };

  return (Request);
});