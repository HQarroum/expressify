const _   = require('lodash');
const Joi = require('joi-browser');

/**
 * Description of the local service.
 */
const manifest = {
  emitter: '__expressify_server',
  protocol: 'expressify',
  version: '2.0.0'
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
 * Represents an Expressify response.
 */
class Response {

  /**
   * Response constructor.
   * @param {object} app the application server instance
   * if executed in a server context.
   * @param {object} e the response attribute object.
   */
  constructor(app, e) {
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
  }

  /**
   * @return a new response instance created from
   * an incoming event object.
   */
  static fromEvent(app, e) {
    return new Response(app, {
      app: app,
      code: e.data.code,
      headers: e.data.headers,
      payload: e.data.payload,
      transactionId: e.data.transactionId,
      caller: e.data.caller,
      origin: e.origin
    });
  }

  /**
   * @return a new response instance created from
   * an incoming request object.
   */
  static fromRequest(app, req) {
    return new Response(app, {
      app: app,
      code: 200,
      transactionId: req.data.transactionId,
      req: req
    });
  }

  /**
   * Sets the given key value pair as a new
   * header in the response.
   */
  set(key, value) {
    this.headers[key] = value;
    return (this);
  }

  /**
   * Sets the status code of the response.
   */
  statusCode(code) {
    this.code = code;
    return (this);
  }

  /**
   * @return a serialized object literal of the current
   * reqresponseuest object.
   */
  serialize(value) {
    return (_.pick(this, _.map(schema._inner.children, (child) => child.key)));
  }

  /**
   * Used by middlewares to respond back to the
   * client.
   */
  send(code, data) {
    if (_.isObject(code)) {
      data = code;
    } else if (_.isNumber(code)) {
      this.code = code;
    } else {
      this.code = 200;
    }
    if (!this.req) return (Promise.reject());
    if (data) {
      this.payload = data;
    }
    this.set('Server', manifest.emitter + '/' + manifest.version);
    return (this.app.strategy.publish(this.serialize()));
  }
}

module.exports = Response;