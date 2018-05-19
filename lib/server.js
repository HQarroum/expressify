const Chain            = require('middleware-chain-js');
const Request          = require('./request');
const Response         = require('./response');
const Event            = require('./event');
const ResourceManager  = require('./resource-manager');
const pathToRegexp     = require('./path-to-regexp');
const guid             = require('./common/guid');

/**
* Called back when a new inbound message is
* received.
*/
const onMessage = function (message) {
  try {
    if (message.data.type === 'request') {
      this.handle(
        Request.from(this, message),
        Response.fromRequest(this, message)
      );
    }
  } catch (e) {
    console.log(e.stack);
  }
};

/**
 * Intercepts `subscription` and `unsubscription`
 * requests from clients.
 * @param {*} req the request object.
 * @param {*} res the response object.
 */
const subscriptionMiddleware = function (req, res, next) {
  if (req.method === 'subscribe') {
    return (this.strategy.subscribe(req, res));
  } else if (req.method === 'unsubscribe') {
    return (this.strategy.unsubscribe(req, res));
  } else if (req.method === 'ping') {
    return (this.strategy.emit('ping', { req, res }));
  }
  next();
};

/**
 * Expressify server class implementation.
 */
class Server extends Chain {
  
  /**
   * Expressify server constructor.
   * @param {*} opts the configuration object to be used.
   */
  constructor(opts) {
    super();
    this.opts      = opts || {};
    this.resource  = new ResourceManager();
    this.onMessage = onMessage.bind(this);
    this.strategy  = this.opts.strategy;
    // Installing internal handlers.
    this.get('/description', function (req, res) {
      res.send(200, req.app.resource.describe());
    }).use(subscriptionMiddleware.bind(this));
  }

  /**
   * Registers a handler for a given method, associated
   * with a resource.
   */
  register(method, url, callback, opts) {
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
  }

  /**
   * Publishes an event associated with the given
   * resource.
   */
  publish(resource, event) {
    return (this.strategy.publish(
      new Event({ resource, payload: event }))
    );
  }

  /**
   * Starts listening for incoming message on the current
   * `strategy` implementation.
   * @return a promise resolved when the underlying strategy
   * has successfully executed the `listen` operation.
   */
  listen() {
    if (!this.listening) {
      this.strategy.on('message', this.onMessage);
      this.listening = true;
      return (this.strategy.listen());
    }
    return (Promise.resolve());
  }

  /**
   * Allows to subscribe on an `event` emitted by
   * the server instance.
   * @param {*} event the event to listen to.
   * @param {*} callback the callback to be called when
   * the `event` is emitted.
   */
  on(event, callback) {
    return (this.strategy.on(event, callback));
  }

  /**
   * Stops listening for incoming message on the current
   * `strategy` implementation.
  * @return a promise resolved when the underlying strategy
   * has successfully executed the `close` operation.
   */
  close() {
    if (this.listening) {
      this.strategy.removeListener('message', this.onMessage);
      this.listening = false;
      return (this.strategy.close());
    }
    return (Promise.resolve());
  }
}

/**
 * Registers helper method in the `Server` class for
 * each action.
 */
['get', 'post', 'patch', 'put', 'head', 'delete', 'options'].forEach(function (method) {
  Server.prototype[method] = function (url, callback, opts) {
    return this.register(method, url, callback, opts);
  };
});

module.exports = Server;