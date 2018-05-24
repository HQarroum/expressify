const _    = require('lodash');
const Joi  = require('joi-browser');
const guid = require('./common/guid');

/**
 * Description of the local service.
 */
const manifest = {
  emitter: '__expressify_emitter',
  protocol: 'expressify',
  version: '2.0.0'
};

/**
 * Schema of an event object.
 */
const schema = Joi.object().keys({
  resource: Joi.string().required(),
  payload: Joi.any().required(),
  transactionId: Joi.string().required(),
  caller: Joi.object().required(),
  type: Joi.string().required(),
  origin: Joi.string().optional(),
  headers: Joi.object().required(),
  opts: Joi.object().required()
}).unknown().required();

/**
 * Represents an Expressify event.
 */
class Event {

  /**
   * Event constructor.
   * @param {object} app the application server instance
   * if executed in a server context.
   * @param {object} e the event attribute object.
   */
  constructor(e) {
    this.opts           = e.opts || {};
    this.event          = e.event || {};
    this.caller         = e.caller || manifest;
    this.resource       = e.resource;
    this.payload        = e.payload || {};
    this.headers        = e.headers || {};
    this.origin         = e.origin;
    this.transactionId  = e.transactionId || guid();
    this.type           = 'event';
    Joi.validate(this, schema, function (err) {
      if (err) {
        throw new Error(err);
      }
    });
  }
  
  /**
   * @return a new event instance built from
   * an inbound message.
   */
  static from(e) {
    return new Event({
      event: e,
      resource: e.data.resource,
      payload: e.data.payload,
      headers: e.data.headers,
      caller: e.data.caller,
      transactionId: e.data.transactionId,
      origin: e.origin,
      opts: e.opts
    });
  }

  /**
   * @return a serialized object literal of the current
   * Event object.
   */
  serialize(value) {
    return (_.pick(this, _.map(schema._inner.children, (child) => child.key)));
  }
}

module.exports = Event;