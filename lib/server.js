 /**
  * Exporting the `ExpressifyServer` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['middleware-chain', './request', './response', './event',
          './resource-manager',
          './path-to-regexp',
          './strategies/post-message/index'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('middleware-chain-js'), require('./request'),
          require('./response'),
          require('./event'),
          require('./resource-manager'),
          require('./path-to-regexp'),
          require('./strategies/post-message/'));
    } else {
        var gl       = this;
        var instance = definition(gl.Chain, gl.ExpressifyRequest, gl.ExpressifyResponse,
          gl.ExpressifyEvent,
          gl.ExpressifyResourceManager,
          gl.pathToRegexp,
          gl.PostMessageStrategy);
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
 })('ExpressifyServer', function (Chain, Request, Response, Event, ResourceManager, pathToRegexp, PostMessageStrategy) {

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
  * Called back when a new inbound message is
  * received.
  */
  const onMessage = function (message) {
    try {
      if (message.data.type === 'request') {
        this.handle(Request.from(this, message), Response.fromRequest(this, message));
      }
    } catch (e) {
      console.log(e.stack);
    }
  };

  /**
   * Registers a subscription request.
   */
  const onSubscribe = function (req, res) {
    const topic = req.resource;
    const id    = guid();

    // Creating subscription for the topic.
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = {};
    }
    // Adding the subscription identifier.
    if (!this.subscribers[topic][id]) {
      this.subscribers[topic][id] = {
        connection: req.strategy
      };
    }
    res.send(200, { topic, id });
  };

  /**
   * Unregisters a previous subscription.
   */
  const onUnsubscribe = function (req, res) {
    const id    = req.payload.id;
    const topic = req.resource;

    // Creating subscription for the topic.
    if (!this.subscribers[topic] || !this.subscribers[topic][id]) {
      return res.send(404, { error: 'No such subscription' });
    }
    // Removing the subscription.
    delete this.subscribers[topic][id];
    res.send(200, { topic, id });
  };

  /**
   * Intercepts `subscription` and `unsubscription`
   * requests from clients.
   * @param {*} req the request object.
   * @param {*} res the response object.
   */
  const subscriptionMiddleware = function (req, res, next) {
    if (req.method === 'subscribe') {
      return (onSubscribe.call(this, req, res));
    } else if (req.method === 'unsubscribe') {
      return (onUnsubscribe.call(this, req, res));
    }
    next();
  };

  /**
   * The query protocol service constructor.
   */
  const Server = function (opts) {
    Chain.call(this);
    this.opts = opts || {};
    this.subscribers = {};
    this.resource    = new ResourceManager();
    this.onMessage   = onMessage.bind(this);
    this.strategy    = this.opts.strategy || new PostMessageStrategy();
    // Installing internal handlers.
    this.get('/description', function (req, res) {
      res.send(200, req.app.resource.describe());
    }).use(subscriptionMiddleware.bind(this));
  };

  /**
   * Prototype inheritence.
   */
  Server.prototype = Object.create(Chain.prototype);

  /**
   * Registers a handler for a given method, associated
   * with a resource.
   */
  Server.prototype.register = function (method, url, callback, opts) {
    // Registering the resource.
    this.resource.add(url, method, opts);
    // Associating a middleware handler.
    this.use(function (req, res, next) {
      const resource = this.resource.get(url);
      const compiled = pathToRegexp(url).exec(req.resource);
      const match    = !!resource && (req.method === method) && !!compiled;

      if (match) {
        req.params = (function () {
          return compiled.slice(1).reduce(function (acc, v, idx, arr) {
            if (resource.params[idx]) {
              acc[resource.params[idx]] = v;
            }
            return (acc);
          }, {});
        })();
        return callback(req, res, next);
      } else {
        req.params = {};
      }
      next();
    }.bind(this));
    return (this);
  };

  /**
   * Registers helper method in the `Server` class for
   * each action.
   */
  ['get', 'post', 'patch', 'put', 'head', 'delete', 'options'].forEach(function (method) {
    Server.prototype[method] = function (url, callback, opts) {
      return this.register(method, url, callback, opts);
    };
  });

  /**
   * Publishes an event associated with the given
   * resource.
   */
  Server.prototype.publish = function (resource, event) {
    const subscribers = Object.keys(this.subscribers[resource]);

    if (subscribers.length > 0) {
      return Promise.all(
        subscribers.map((id) => this.subscribers[resource][id].connection.publish(new Event({
          resource: resource,
          payload: event,
          subscriptionId: id
        })))
      );
    }
    return (Promise.resolve());
  };

  /**
   * Starts listening for incoming message on the current
   * `connection` implementation.
   * Emits a message to a potential parent window to signal
   * that the application is now ready to receive messages.
   */
  Server.prototype.listen = function () {
    if (!this.listening) {
      this.strategy.listen();
      this.strategy.on('message', this.onMessage);
      this.listening = true;
    }
    return (this);
  };

  /**
   * Stops listening for incoming message on the current
   * `connection` implementation.
   */
  Server.prototype.close = function () {
    if (this.listening) {
      this.strategy.close();
      this.strategy.removeListener('message', this.onMessage);
      this.listening = false;
    }
    return (this);
  };

  return (Server);
 });
