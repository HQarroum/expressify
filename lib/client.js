 /**
  * Exporting the `ExpressifyClient` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['event-emitter', './response', 'timed-cache'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        var EventEmitter = require('events').EventEmitter;
        module.exports = definition(EventEmitter,
          require('./response'),
          require('timed-cache'));
    } else {
        var gl       = this;
        var instance = definition(gl.EventEmitter2, gl.Response, gl.Cache);
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
 })('ExpressifyClient', function (Emitter, Response, Cache) {

  /**
   * Throws an exception with an error associated with the
   * given message as a parameter.
   */
  var unexpected = (message) => {
    throw new Error(message);
  };

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
   * Creates an iframe in the DOM associated with the
   * given `url`.
   * @return a promise which is resolved when the content
   * associated with the iframe is loaded.
   */
  var createIframe = (url) => {
    console.log('Creating iframe');
    return new Promise(function (resolve, reject) {
      var iframe = document.createElement('iframe');
      iframe.onload = function () {
        resolve(iframe);
      };
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
    });    
  };

  /**
   * Called back when a new inbound message is
   * received.
   */
  var onClientMessage = function (message) {
    try {
      if (message.data.type === 'response') {
        var response = Response.fromEvent(this, message);
        var callback = this.cache.get(message.data.transactionId);
        if (callback) {
          callback(message);
        } else {
          console.log('No callback found for id', message.data.transactionId);
        }
      }
    } catch (e) {
      console.log(e.stack);
    }
  };

  /**
   * The query protocol client constructor.
   */
  var QueryClient = function (opts) {
    Emitter.apply(this);
    this.opts = opts || {};
    this.url = this.opts.url || unexpected('An URL to an endpoint is required');
    this.onClientMessage = onClientMessage.bind(this);
    this.cache = new Cache();
    this.connection = this.opts.connection || window;
    this.connection.addEventListener('message', this.onClientMessage);
  };

  /**
   * Prototype inheritence.
   */
  QueryClient.prototype = Object.create(Emitter.prototype);

  /**
   * Issues a request
   */
  QueryClient.prototype.request = function (object) {
    var id = guid();
    object.opts = object.opts || {};
    return createIframe(this.url).then((iframe) => {
      return new Promise((resolve, reject) => {
        this.cache.put(id, (res) => resolve(res), {
          callback: (key) => reject(new Error('Request timed out'))
        });
        try {
          this.connection.postMessage({
            method: object.method,
            resource: object.url,
            payload: object.opts.data || {},
            transactionId: id,
            headers: object.opts.headers || {},
            caller: {},
            type: 'request'
          }, object.opts.domain || '*');
        } catch (e) {
          return (reject(e));
        }
      });
    });
  };

  /**
   * Registers helper method in the `QueryClient` class for
   * each action.
   */
  ['get', 'post', 'patch', 'put', 'head', 'delete'].forEach((method) => {
    QueryClient.prototype[method] = function (url, opts) {
      return this.request({
        method: method,
        url: url,
        opts: opts
      });
    };
  });

  return (QueryClient);
 });