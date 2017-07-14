 /**
  * Exporting the `Event` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['lodash', 'Joi'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('lodash'), require('joi'));
    } else {
        var gl       = this;
        var instance = definition(gl._, gl.Joi);
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
 })('ExpressifyEvent', function (_, Joi) {

  /**
   * A string representation of a randomly
   * created GUID.
   */
  var guid = () => {
    var s4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  /**
   * Schema of an event object.
   */
  var schema = Joi.object().keys({
    resource: Joi.string().required(),
    payload: Joi.any().required(),
    transactionId: Joi.string().required(),
    caller: Joi.object().required(),
    type: Joi.string().required(),
    origin: Joi.string().optional()
  }).unknown().required();

  /**
   * Description of the local service.
   */
  var manifest = {
    emitter: '__expressify_emitter',
    protocol: 'expressify',
    version: '1.0.0'
  };

  /**
   * Event constructor.
   * @param {object} app the application server instance
   * if executed in a server context.
   * @param {object} e the event attribute object.
   */
  var Event = function (e) {
    this.event          = e.event || {};
    this.caller         = e.caller || manifest;
    this.resource       = e.resource;
    this.payload        = e.payload || {};
    this.origin         = e.origin;
    this.transactionId  = e.transactionId || guid();
    this.subscriptionId = e.subscriptionId;
    this.type           = 'event';
    Joi.validate(this, schema, function (err) {
      if (err) {
        throw new Error(err);
      }
    });
  };

  /**
   * @return a new event instance built from
   * an inbound message.
   */
  Event.from = function (e) {
    return new Event({
      event: e,
      resource: e.data.resource,
      payload: e.data.payload,
      caller: e.data.caller,
      transactionId: e.data.transactionId,
      subscriptionId: e.data.subscriptionId,
      origin: e.origin
    });
  };

  /**
   * @return a serialized object literal of the current
   * Event object.
   */
  Event.prototype.serialize = function (value) {
    return (_.pick(this, _.map(schema._inner.children, function (child) {
      return (child.key);
    })));
  };

  return (Event);
});