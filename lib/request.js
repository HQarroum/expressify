 /**
  * Exporting the `Request` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['lodash', 'Joi'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        const { URL } = require('url');
        module.exports = definition(require('lodash'), require('joi-browser'), URL);
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
 })('ExpressifyRequest', function (_, Joi, URL_) {

  /**
   * Browser + Node.js support for WHATWG `URL`.
   */
  const URLImpl = ('URL' in this) ? URL : URL_;

  /**
   * A string representation of a randomly
   * created GUID.
   */
  const guid = () => {
    const s4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  /**
   * @return the path associated with the
   * current request's resource.
   */
  const getPath = (resource) => new URLImpl(resource, "http://placeholder").pathname;

  /**
   * @return a query object associated with the
   * current request's resource.
   */
  const getQuery = (resource) => {
    const object = {};
    const query = new URLImpl(resource, "http://placeholder");

    for (let p of query.searchParams) {
      object[p[0]] = p[1];
    }
    return (object);
  };

  /**
   * Schema of a request object.
   */
  const schema = Joi.object().keys({
    resource: Joi.string().required(),
    method: Joi.string().required(),
    payload: Joi.any().required(),
    transactionId: Joi.string().required(),
    headers: Joi.object().required(),
    caller: Joi.object().required(),
    type: Joi.string().required(),
    origin: Joi.string().optional(),
    query: Joi.object().required()
  }).unknown().required();

  /**
   * Description of the local service.
   */
  const manifest = {
    emitter: '__expressify_client',
    protocol: 'expressify',
    version: '1.0.0'
  };

  /**
   * Request constructor.
   * @param {object} app the application server instance
   * if executed in a server context.
   * @param {object} e the request attribute object.
   */
  const Request = function (app, e) {
    if (arguments.length === 1) {
      e = app;
      app = {};
    } else {
      this.app         = app || {};
    }
    this.event         = e.event || {};
    this.caller        = e.caller || manifest;
    this.resource      = getPath(e.resource);
    this.method        = e.method;
    this.payload       = e.payload || {};
    this.headers       = e.headers || {};
    this.origin        = e.origin;
    this.transactionId = e.transactionId || guid();
    this.query         = e.query || getQuery(e.resource);
    this.strategy      = e.strategy;
    this.type          = 'request';
    this.set('User-Agent', manifest.emitter + '/' + manifest.version);
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
      event: e,
      method: e.data.method,
      resource: e.data.resource,
      headers: e.data.headers,
      payload: e.data.payload,
      caller: e.data.caller,
      transactionId: e.data.transactionId,
      origin: e.origin,
      query: e.data.query,
      strategy: e.strategy
    });
  };

  /**
   * Sets the given key value pair as a new
   * header in the request.
   */
  Request.prototype.set = function (key, value) {
    this.headers[key] = value;
    return (this);
  };

  /**
   * @return the value associated with the
   * header with the key equals to `key`,
   * undefined is no such header exist in the
   * request object.
   */
  Request.prototype.get = function (value) {
    return (this.headers[value]);
  };

  /**
   * @return a serialized object literal of the current
   * request object.
   */
  Request.prototype.serialize = function (value) {
    return (_.pick(this, _.map(schema._inner.children, function (child) {
      return (child.key);
    })));
  };

  return (Request);
});