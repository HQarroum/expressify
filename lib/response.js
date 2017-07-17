 /**
  * Exporting the `Response` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['lodash', 'Joi'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('lodash'), require('joi-browser'));
    } else {
        const gl       = this;
        const instance = definition(gl._, gl.Joi);
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
 })('ExpressifyResponse', function (_, Joi) {

  /**
   * Description of the local service.
   */
  const manifest = {
    emitter: '__expressify_server',
    protocol: 'expressify',
    version: '1.0.0'
  };

  /**
   * Schema of a response object.
   */
  const schema = Joi.object().keys({
    code: Joi.number().required(),
    transactionId: Joi.string().required(),
    headers: Joi.object().required(),
    payload: Joi.any().required(),
    caller: Joi.object().required(),
    type: Joi.string().required(),
    origin: Joi.string().optional()
  }).unknown().required();

  /**
   * Response constructor.
   * @param {object} app the application server instance
   * if executed in a server context.
   * @param {object} e the response attribute object.
   */
  const Response = function (app, e) {
    this.app           = app || {};
    this.caller        = e.caller || manifest;
    this.code          = e.code;
    this.headers       = e.headers || {};
    this.payload       = e.payload || {};
    this.req           = e.req;
    this.origin        = e.origin;
    this.transactionId = e.transactionId;
    this.type          = 'response';
    Joi.validate(this, schema, function (err) {
      if (err) {
        throw new Error(err);
      }
    });
  };

  /**
   * @return a new request instance created from
   * an incoming response.
   */
  Response.fromEvent = (app, e) => new Response(app, {
    app: app,
    code: e.data.code,
    headers: e.data.headers,
    payload: e.data.payload,
    transactionId: e.data.transactionId,
    caller: e.data.caller,
    origin: e.origin
  });

  /**
   * @return a new request instance created from
   * an incoming request.
   */
  Response.fromRequest = (app, req) => new Response(app, {
    app: app,
    code: 200,
    transactionId: req.data.transactionId,
    req: req
  });

  /**
   * Sets the given key value pair as a new
   * header in the response.
   */
  Response.prototype.set = function (key, value) {
    this.headers[key] = value;
    return (this);
  };

  /**
   * Sets the status code of the response.
   */
  Response.prototype.statusCode = function (code) {
    this.code = code;
    return (this);
  };

  /**
   * @return a serialized object literal of the current
   * reqresponseuest object.
   */
  Response.prototype.serialize = function (value) {
    return (_.pick(this, _.map(schema._inner.children, function (child) {
      return (child.key);
    })));
  };

  /**
   * Used by middlewares to respond back to the
   * client.
   */
  Response.prototype.send = function (code, data) {
    if (_.isObject(code)) {
      data = code;
    } else if (_.isNumber(code)) {
      this.code = code;
    } else {
      this.code = 200;
    }
    if (!this.req) {
      return (Promise.reject());
    }
    if (data) {
      this.payload = data;
    }
    this.set('Server', manifest.emitter + '/' + manifest.version);
    return this.req.strategy.publish(this.serialize());
  };

  return (Response);
 });