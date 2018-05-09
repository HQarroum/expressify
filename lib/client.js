const _        = require('lodash');
const Cache    = require('timed-cache');
const Request  = require('./request');
const Response = require('./response');
const Event    = require('./event');

/**
 * Throws an exception if the given `opts` object
 * is invalid.
 */
const enforceOptions = (opts) => {
  if (!opts || typeof opts.strategy !== 'object') {
    throw new Error('An options object with a valid strategy was expected');
  }
};

/**
 * Called back when a new incoming response has
 * been received.
 */
const onResponse = function (message) {
  const callback = this.cache.get(message.data.transactionId);
  callback && callback(Response.fromEvent(this, message));
};

/**
 * Called back when a new incoming event has
 * been received, and dispatches the event to
 * the subscribed listeners.
 */
const onEvent = function (message) {
  const event = Event.from(message);
  (this.subscribers[event.resource] || []).forEach((subscription) => {
    subscription.callback(event);
  });
};

/**
 * Called back when a new inbound message has
 * been received.
 */
const onMessage = function (message) {
  try {
    if (message.data.type === 'response') {
      onResponse.call(this, message);
    } else if (message.data.type === 'event') {
      onEvent.call(this, message);
    }
  } catch (e) {
    console.log(e.stack);
  }
};

/**
 * Creates a `ping` task executed at a regular
 * interval as long as subscribed the given resource.
 */
const schedulePing = function (interval, resource) {
  return setInterval(() => {
    this.request({ method: 'ping', url: resource, opts: {
      data: { resources: [resource] }
    }});
  }, interval);
};

/**
 * Expressify client class implementation.
 */
class Client {

  /**
   * Expressify client constructor.
   * @param {*} opts the configuration object to be used.
   */
  constructor(opts) {
    enforceOptions(opts);
    this.opts = opts;
    this.subscribers = {};
    this.onMessage = onMessage.bind(this);
    this.timeout = this.opts.timeout || (15 * 1000);
    this.pingInterval = this.opts.pingInterval || (10 * 1000);
    this.cache = new Cache({ defaultTtl: this.timeout });
    this.strategy = this.opts.strategy;
    this.strategy.on('message', this.onMessage);
  }

  /**
   * Issues a custom request.
   * @return a promise resolved when the request
   * has been executed, or rejected if an error
   * has occured.
   */
  request(object) {
    object.opts = object.opts || {};
    // Creating the request object.
    const req = new Request({
      method: object.method,
      resource: object.url,
      payload: object.opts.data,
      headers: object.opts.headers
    });
    return new Promise((resolve, reject) => {
      this.cache.put(req.transactionId, (res) => resolve(res), {
        callback: (key) => reject(new Error('Request timed out')),
        ttl: (object.opts.timeout || this.opts.timeout)
      });
      this.strategy.publish(req).catch(reject);
    });
  }

  /**
   * Helper method that will asynchronously return
   * the description of the resources exposed by
   * the associated server.
   */
  describe() {
    return this.get('/description');
  }

  /**
   * Subscribes to a remote resource on the server.
   * Does not issue a subscription request to the server
   * if there is already a subscription for this client
   * on the server.
   */
  subscribe(resource, callback) {
    if (this.subscribers[resource]) {
      // We are already subscribed on the server.
      return Promise.resolve(this.subscribers[resource].push({
        callback: callback,
        id: this.subscribers[resource][0].id
      }));
    }
    // We need to subscribe on the server.
    return this.request({ method: 'subscribe', url: resource }).then((response) => {
      // If the subscription failed, we abort.
      if (response.code !== 200) {
        return (Promise.reject(response));
      }
      // Creating subscription for the topic.
      if (!this.subscribers[resource]) {
        this.subscribers[resource] = [];
      }
      // Registering the subscription callback.
      this.subscribers[resource].push({
        callback: callback,
        id: response.payload.id,
        timer: schedulePing.call(this, this.pingInterval, resource)
      });
      return (Promise.resolve(response));
    });
  }

  /**
   * Unsubscribes from a remote resource on the server.
   * Behaves like a reference-counter in the sense that an unsubscription
   * on the server will happen when the number of listeners for a given
   * resource has reached zero.
   */
  unsubscribe(resource, callback) {
    if (!this.subscribers[resource] || !this.subscribers[resource].length) {
      // No subscribers are associated with the given `resource`.
      return (Promise.reject(`No subscribers associated with ${resource}`));
    }
    const id = this.subscribers[resource][0].id;
    // Removing the given callback from the listeners, and
    // cleaning the associated interval.
    _.remove(this.subscribers[resource], (o) => {
      const remove = o.callback === callback;
      if (remove) clearInterval(o.timer)
      return (remove);
    });
    if (this.subscribers[resource].length === 0) {
      // No more listeners for this `resource`, unsubscribing at the server level.
      return this.request({ method: 'unsubscribe', url: resource, opts: {
        data: { id }
      }}).then((response) => (response.code !== 200) ?
        Promise.reject(response) :
        Promise.resolve()
      );
    }
    return (Promise.resolve());
  }
}

/**
 * Registers helper method in the `Client` class for
 * each action.
 */
['get', 'post', 'patch', 'put', 'head', 'delete', 'options'].forEach((method) => {
  Client.prototype[method] = function (url, opts) {
    return this.request({
      method: method,
      url: url,
      opts: opts
    });
  };
});

module.exports = Client;