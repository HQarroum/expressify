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

  /**
   * The different steps of the delegation chain
   * handling each incoming request messages.
   */
  var requestChain = [

    /**
     * Verifies the message format.
     */
    function (input, output, next) {
      // Verifying whether the message has been accepted by the delegate.
      if (!output.protocol.listeners.onRequestReceived(input.event)) {
        return send(input.event, response(403));
      }
    },

    /**
     * Handles `describe` action requests.
     */
    function (input, output, next) {
      if (input.event.action === 'describe') {
        output.reply(manifest);
      }
      next();
    },

    /**
     * Handles `store` action requests.
     */
    function (input, output, next) {
      if (input.event.action === 'store') {
        var uuid = guid();
        // Persisting the payload.
        window.localStorage.put(uuid, event.payload.object);
        // Replying to the emitter.
        return send(event, response(200));
      }
      next();
    },
  ];

  /**
   * The different steps of the delegation chain
   * handling each incoming response messages.
   */
  var responseChain = [

  ];

  /**
   * The different steps of the delegation chain
   * handling each incoming messages.
   */
  var protocolChain = [

    /**
     * Verifies the message format.
     */
    function (input, output, next) {
      if (!input.event.payload
        || !input.event.payload.object
        || !input.event.payload.version
        || !input.event.payload.action
        || !input.event.payload.type
        || !isNumber(input.event.payload.transactionId)
        || input.event.payload.emitter !== manifest.emitter) {
        next(new Error({ message: response(403) }));
      }
    },

    /**
     * Handles un-treated requests.
     */
    function (input, output, next) {
      output.reply({
        code: 404,
        message: 'Unhandled input message'
      });
    },

    /**
     * Returns any error to the requester.
     */
    function (err, input, output, next) {
      return send(input.event, err.message);
    }
  ];

  /**
   * Called back when a new inbound message is
   * received.
   */
  var onMessage = function (event) {
    this.chain.handle({ event: event }, {
      protocol: this,
      reply: createResponder(event)
    });
  };

  /**
   * The query protocol service constructor.
   */
  var QueryProtocol = function () {
    this.chain     = new Chain();
    this.handle    = false;
    this.listeners = defaults();
    this.onMessage = onMessage.bind(this);
    // Using the protocol chain to handle messages.
    this.chain.use(protocolChain);
  };

  /**
   * Causes the local service to start accepting
   * incoming messages.
   * @param listeners an object defining what lifecycle
   * event listeners the client is interested in handling.
   */
  QueryProtocol.prototype.accept = function (listeners) {
    if (!this.handle) {
      window.addEventListener('message', this.onMessage);
      this.handle = true;
      this.listeners = defaults(listeners);
      return (this);
    }
    throw new Error('Connection already open');
  };

  /**
   * Causes the local service to stop listening to
   * incoming messages.
   */
  QueryProtocol.prototype.close = function () {
    window.removeEventListener('message', this.onMessage);
    this.handle = false;
  };

  /**
   * @return whether the local service is currently
   * accepting new inbound messages.
   */
  QueryProtocol.prototype.isOpen = function () {
    return (this.handle);
  };

  return (QueryProtocol);
});
