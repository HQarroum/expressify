const _    = require('lodash');
const Joi  = require('joi-browser');
const guid = require('./common/guid');

/**
 * Browser + Node.js support for WHATWG `URL`.
 */
const URLImpl = (typeof module !== 'undefined' && module.exports ? require('url').URL : this.URL);

/**
 * Description of the local client.
 */
const manifest = {
  emitter: '__expressify_client',
  protocol: 'expressify',
  version: '2.0.0'
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
 * Represents an Expressify request.
 */
class Request {
  
  /**
   * Request constructor.
   * @param {object} app the application server instance
   * if executed in a server context.
   * @param {object} e the request attribute object.
   */
  constructor(app, e) {
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
  }

  /**
   * @return a new request instance built from
   * another request.
   */
  static from(app, e) {
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
  }

  /**
   * Sets the given key value pair as a new
   * header in the request.
   */
  set(key, value) {
    this.headers[key] = value;
    return (this);
  }

  /**
   * @return the value associated with the
   * header with the key equals to `key`,
   * undefined is no such header exist in the
   * request object.
   */
  get(value) {
    return (this.headers[value]);
  }

  /**
   * @return a serialized object literal of the current
   * request object.
   */
  serialize(value) {
    return (_.pick(this, _.map(schema._inner.children, (child) => child.key)));
  }
}

module.exports = Request;