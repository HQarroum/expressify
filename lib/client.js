 /**
  * Exporting the `ExpressifyClient` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['./request', './response', './event', 'timed-cache'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition(require('./request'),
          require('./response'),
          require('./event'),
          require('timed-cache'));
    } else {
        const gl       = this;
        const instance = definition(gl.Request, gl.Response, gl.Event, gl.Cache);
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
 })('ExpressifyClient', function (Request, Response, Event, Cache) {

  /**
   * Throws an exception with an error associated with the
   * given message as a parameter.
   */
  const unexpected = (message) => {
    throw new Error(message);
  };

  /**
   * Creates an iframe in the DOM associated with the
   * given client's `url`.
   * @return a promise which is resolved when the content
   * associated with the iframe is loaded.
   */
  const createIframe = (client) => {
    var p = client.cache.get(client.url);
    if (p) {
      return (p);
    }
    var promise = new Promise(function (resolve, reject) {
      var iframe = document.createElement('iframe');
      iframe.onload = function () {
        client.connection.addEventListener('message', function (e) {
          client.connection.removeEventListener('message', arguments.callee);
          if (e.data.resource === '__expressify' && e.data.payload.online === true) {
            resolve(iframe);
          }
        });
      };
      iframe.style.display = 'none';
      iframe.src = client.url;
      document.body.appendChild(iframe);
    });
    client.cache.put(client.url, promise, { ttl: 10000 * 1000 });
    return (promise);
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
    const event        = Event.from(message);
    const subscription = this.subscribers[event.resource];

    if (subscription && subscription[event.subscriptionId]) {
      subscription[event.subscriptionId].callback(event);
    }
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
    Emitter.apply(this);
    this.opts = opts || {};
    this.subscribers = {};
    this.url = this.opts.url || unexpected('An URL to an endpoint is required');
    this.onMessage = onMessage.bind(this);
    this.cache = new Cache({ defaultTtl: opts.timeout || (10 * 1000) });
    this.connection = this.opts.connection || window;
    this.connection.addEventListener('message', this.onMessage);
  };

  /**
   * Prototype inheritence.
   */
  Client.prototype = Object.create(Emitter.prototype);

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
    return createIframe(this).then((iframe) => {
      return new Promise((resolve, reject) => {
        this.cache.put(req.transactionId, (res) => resolve(res), {
          callback: (key) => reject(new Error('Request timed out'))
        });
        try {
          iframe.contentWindow.postMessage(req, object.opts.domain || '*');
        } catch (e) {
          return (reject(e));
        }
      });
    });
  };

  /**
   * Subscribes to a remote resource on the server.
   */
  Client.prototype.subscribe = function (resource, callback) {
    return this.post('/subscription', {
      data: {
        resource: resource
      }
    }).then((response) => {
      const id = response.payload.id;
      // If the subscription failed, we abort.
      if (response.code !== 200) {
        return (Promise.reject(response));
      }
      // Creating subscription for the topic.
      if (!this.subscribers[resource]) {
        this.subscribers[resource] = {};
      }
      // Registering the subscription callback.
      if (!this.subscribers[resource][id]) {
        this.subscribers[resource][id] = {
          callback: callback
        };
      }
      return (Promise.resolve(response));
    });
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

  return (Client);
 });