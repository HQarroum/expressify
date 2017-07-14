 /**
  * Exporting the `ExpressifyServer` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define([
          'middleware-chain',
          './request',
          './response',
          './event',
          './resource-manager',
          './path-to-regexp'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('middleware-chain-js'),
          require('./request'),
          require('./response'),
          require('./event'),
          require('./resource-manager'),
          require('./path-to-regexp'));
    } else {
        var gl       = this;
        var instance = definition(gl.Chain,
          gl.ExpressifyRequest,
          gl.ExpressifyResponse,
          gl.ExpressifyEvent,
          gl.ExpressifyResourceManager,
          gl.pathToRegexp);
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
 })('ExpressifyServer', function (Chain, Request, Response, Event, ResourceManager, pathToRegexp) {

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
  * Called back when a new inbound message is
  * received.
  */
  var onMessage = function (message) {
    try {
      if (message.data.type === 'request') {
        this.handle(Request.from(this, message), Response.fromRequest(this, message));
      }
    } catch (e) {
      console.log(e.stack);
    }
  };

  /**
   * Resource subscription middleware.
   */
  var onSubscribe = function (req, res) {
    var topic = req.payload.resource;
    var id    = guid();

    // Creating subscription for the topic.
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = {};
    }
    // Adding the subscription identifier.
    if (!this.subscribers[topic][id]) {
      this.subscribers[topic][id] = {
        connection: req.event.source
      };
    }
    res.send(200, { topic, id });
  };

  /**
   * The query protocol service constructor.
   */
  var Server = function (opts) {
    Chain.call(this);
    this.opts = opts || {};
    this.subscribers = {};
    this.resource    = new ResourceManager();
    this.onMessage   = onMessage.bind(this);
    this.onSubscribe = onSubscribe.bind(this);
    this.connection  = this.opts.connection || window;
    // Installing internal handlers.
    this.get('/description', function (req, res) {
      res.send(200, req.app.resource.describe());
    }).post('/subscription', this.onSubscribe);
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
      var resource = this.resource.get(url);
      var compiled = pathToRegexp(url).exec(req.resource);
      var match    = !!resource && (req.method === method) && !!compiled;

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
    Object.keys(this.subscribers[resource] || []).forEach((id) => {
      this.subscribers[resource][id].connection.postMessage(new Event({
        resource: resource,
        payload: event,
        subscriptionId: id
      }), '*');
    });
  };

  /**
   * Starts listening for incoming message on the current
   * `connection` implementation.
   * Emits a message to a potential parent window to signal
   * that the application is now ready to receive messages.
   */
  Server.prototype.listen = function () {
    if (!this.listening) {
      this.connection.addEventListener('message', this.onMessage);
      this.listening = true;
      if (parent) {
        parent.postMessage(new Event({
          resource: '__expressify',
          payload: {
            online: true
          }
        }).serialize(), '*');
      }
    }
  };

  /**
   * Stops listening for incoming message on the current
   * `connection` implementation.
   */
  Server.prototype.close = function () {
    if (this.listening) {
      this.connection.removeEventListener('message', this.onMessage);
      this.listening = false;
    }
  };

  return (Server);
 });
