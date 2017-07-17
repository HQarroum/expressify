 /**
  * Exporting the `ExpressifyClient` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['lodash', './request', './response', './event', 'timed-cache', './strategies/post-message/index'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition(require('lodash'), require('./request'), require('./response'),
          require('./event'),
          require('timed-cache'),
          require('./strategies/post-message/'));
    } else {
        const gl       = this;
        const instance = definition(gl._, gl.Request, gl.Response, gl.Event, gl.Cache, gl.PostMessageStrategy);
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
 })('ExpressifyClient', function (_, Request, Response, Event, Cache, PostMessageStrategy) {

  /**
   * Throws an exception with an error associated with the
   * given message as a parameter.
   */
  const unexpected = (message) => {
    throw new Error(message);
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
   * The query protocol client constructor.
   */
  const Client = function (opts) {
    this.opts = opts || {};
    this.subscribers = {};
    this.url = this.opts.url || unexpected('An URL to an endpoint is required');
    this.onMessage = onMessage.bind(this);
    this.cache = new Cache({ defaultTtl: this.opts.timeout || (10 * 1000) });
    this.strategy = this.opts.strategy || new PostMessageStrategy({
      url: this.opts.url
    });
    this.strategy.on('message', this.onMessage);
    this.strategy.listen();
  };

  /**
   * Issues a custom request.
   */
  Client.prototype.request = function (object) {
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
      this.strategy.publish(req);
    });
  };

  /**
   * Helper method that will asynchronously return
   * the description of the resources exposed by
   * the associated server.
   */
  Client.prototype.describe = function () {
    return this.get('/description');
  };

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

  /**
   * Subscribes to a remote resource on the server.
   * Does not issue a subscription request to the server
   * if there is already a subscription for this client
   * on the server.
   */
  Client.prototype.subscribe = function (resource, callback) {
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
        id: response.payload.id
      });
      return (Promise.resolve(response));
    });
  };

  /**
   * Unsubscribes from a remote resource on the server.
   * Behaves like a reference-counter in the sense that an unsubscription
   * on the server will happen when the number of listeners for a given
   * resource has reached zero.
   */
  Client.prototype.unsubscribe = function (resource, callback) {
    if (!this.subscribers[resource] || !this.subscribers[resource].length) {
      // No subscribers are associated with the given `resource`.
      return (Promise.reject(`No subscribers associated with ${resource}`));
    }
    const id = this.subscribers[resource][0].id;
    // Removing the given callback from the listeners.
    _.remove(this.subscribers[resource], (o) => o.callback === callback);
    if (this.subscribers[resource].length === 0) {
      // No more listeners for this `resource`, unsubscribing at the server level.
      return this.request({ method: 'unsubscribe', url: resource, opts: {
        data: { id }
      }}).then((response) => ((response.code !== 200) ?
        Promise.reject(response) :
        Promise.resolve()
      ));
    }
    return (Promise.resolve());
  };

  return (Client);
 });