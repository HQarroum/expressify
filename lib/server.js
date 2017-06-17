/**
 * Called back when a new inbound message is
 * received.
 */
var onMessage = function (message) {
  try {
    this.handle(new Request(this, message), new Response(this, message));
  } catch (e) {
    console.log(e.stack);
  }
};

/**
 * The query protocol service constructor.
 */
var QueryServer = function (opts) {
  Chain.call(this);
  this.opts = opts || {};
  this.resource   = new ResourceManager();
  this.onMessage  = onMessage.bind(this);
  this.connection = this.opts.connection || window;
  // Installing the `describe` handler.
  this.get('/describe', function (req, res) {
    res.reply(200, req.app.resource.describe());
  });
};

/**
 * Prototype inheritence.
 */
QueryServer.prototype = Object.create(Chain.prototype);

/**
 * Registers a handler for a given method, associated
 * with a resource.
 */
QueryServer.prototype.register = function (method, url, callback) {
  // Registering the resource.
  this.resource.add(url, method);
  // Associating a middleware handler.
  this.use(function (req, res, next) {
    var resource = this.resource.get(url);
    var compiled = pathToRegexp(url).exec(req.path);
    var match    = !!resource && !!resource[req.method] && !!compiled;

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
};

/**
 * Registers helper method in the `QueryServer` class for
 * each action.
 */
['get', 'post', 'patch', 'put', 'head', 'delete'].forEach(function (method) {
  QueryServer.prototype[method] = function (url, callback) {
    this.register(method, url, callback);
  };
});

/**
 * Starts listening for incoming message on the current
 * `connection` implementation.
 */
QueryServer.prototype.listen = function () {
  this.connection.addEventListener('message', this.onMessage);
  this.listening = true;
};

/**
 * Stops listening for incoming message on the current
 * `connection` implementation.
 */
QueryServer.prototype.close = function () {
  if (this.listening) {
    this.connection.removeEventListener('message', this.onMessage);
    this.listening = false;
  }
};
