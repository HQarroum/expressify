/**
 * //////////////////////////////////////
 * /////// Query Protocol module  ///////
 * //////////////////////////////////////
 *
 * A protocol designed to make serverless web apps
 * comunication efficient and secure.
 */

/**
 * Exporting the module appropriately given the
 * environment (AMD, Node.js and the browser).
 */
(function (name, definition) {
  if (typeof define === 'function' && define.amd) {
      // Defining the module in an AMD fashion.
      define(['middleware-chain'], definition);
  } else {
      var instance = definition(this.Chain);
      var old      = this[name];

      /**
       * Allowing to scope the module
       * avoiding global namespace pollution.
       */
      instance.noConflict = function () {
          this[name] = old;
          return instance;
      };
      // Exporting the module in the global
      // namespace in a browser context.
      this[name] = instance;
  }
})('QueryProtocol', function (Chain) {

  /**
   * Description of the local service.
   */
  var manifest = {
    emitter: '__query-protocol',
    version: '1.0.0',
    actions: {
      'describe': 'Returns a description of a remote query protocol service',
      'store': 'Passes a payload securely to a remote query protocol service'
    }
  };

  var resources = {};

  /**
   * Default definition of callbacks associated
   * with lifecycle events of the local service.
   */
  var callbacks = {
    onRequestReceived: function () {
      return (true);
    },
    onResponseSent: function () {}
  };

  /**
   * @return a default callback object for
   * lifecycle events.
   */
  var defaults = function (object) {
    if (!object) {
      return (callbacks);
    }
    for (var entry in callbacks) {
      if (callbacks.hasOwnProperty(entry)) {
        if (!object[entry]) {
          object[entry] = callbacks[entry];
        }
      }
    }
  };

  /**
   * A string representation of a randomly
   * created GUID.
   */
  var guid = function () {
    var s4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  function isNumber(obj) { return !isNaN(parseFloat(obj)) }

  var send = function (event, message) {
    event.source.postMessage(message, event.origin);
  };

  var describe = function (req, res, next) {
    if (req.path === '/describe') {
      res.reply(manifest);
    }
    next();
  };

  /**
   * Called back when a new inbound message is
   * received.
   */
  var onMessage = function (e) {
    try {
      this.handle(new Request(this, e), new Response(this, e));
    } catch (e) {
      console.log(e.stack);
    }
  };

  /**
   * The query protocol service constructor.
   */
  var QueryServer = function (opts) {
    Chain.call(this);
    this.onMessage = onMessage.bind(this);
    //this.use(protocolChain);
    this.connection = opts.connection;
    this.connection.addEventListener('message', this.onMessage);
  };

  QueryServer.prototype = Object.create(Chain.prototype);

  QueryServer.prototype.register = function (method, url, callback) {
    this.use(function (req, res, next) {
      if (req.method === method && req.path === url) {
        callback(req, res, next);
      }
    });
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

  return {
    Server: QueryServer
  };
});
