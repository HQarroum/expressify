 /**
  * Exporting the `ExpressifyPostMessagePolicy` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['event-emitter', 'timed-cache'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        var EventEmitter = require('events').EventEmitter;
        module.exports = definition(EventEmitter, require('timed-cache'));
    } else {
        const gl       = this;
        const instance = definition(gl.EventEmitter2, gl.Cache);
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
 })('ExpressifyPostMessagePolicy', function (Emitter, Cache) {

  /**
   * Creates an iframe in the DOM associated with the
   * client's `url`.
   * @return a promise which is resolved when the content
   * associated with the iframe is loaded.
   */
  const createIframe = (client) => {
    var p = client.cache.get(client.opts.url);
    if (p) {
      return (p);
    }
    var promise = new Promise(function (resolve, reject) {
      var iframe = document.createElement('iframe');
      iframe.onload = function () {
        client.connection.addEventListener('message', function (e) {
          client.connection.removeEventListener('message', arguments.callee);
          if (e.data['__pm_strategy'] && e.data['__pm_strategy'].online === true) {
            resolve(iframe);
          }
        });
      };
      iframe.style.display = 'none';
      iframe.src = client.opts.url;
      document.body.appendChild(iframe);
    });
    client.cache.put(client.opts.url, promise, { ttl: 10000 * 1000 });
    return (promise);
  };

  /**
   * Called back when a new inbound message has
   * been received.
   */
  const onMessage = function (message) {
    try {
      if (!message.data.__pm_strategy) {
        message.strategy = this.opts.url ? this : new Strategy({
          timeout: this.timeout,
          window: message.source
        });
        this.emit('message', message);
      }
    } catch (e) {
      console.log(e.stack);
    }
  };

  /**
   * The query protocol client constructor.
   */
  const Strategy = function (opts) {
    Emitter.apply(this);
    this.opts = opts || {};
    this.domain = this.opts.domain || '*';
    this.timeout = this.opts.timeout || (10 * 1000);
    this.onMessage = onMessage.bind(this);
    this.cache = new Cache({ defaultTtl: this.timeout });
    this.connection = this.opts.connection || window;
  };

  /**
   * Event emitter prototype inheritance.
   */
  Strategy.prototype = Object.create(Emitter.prototype);
  
  /**
   * Publishes a message to the predefined URL.
   */
  Strategy.prototype.publish = function (object) {
    // Sending the message through an iframe.
    if (this.opts.url) {
      return createIframe(this).then((iframe) => {
        try {
          return Promise.resolve(
            iframe.contentWindow.postMessage(object, this.domain)
          );
        } catch (e) {
          return (Promise.reject(e));
        }
      });
    }
    // Sending the message through a window object.
    if (this.opts.window) {
      return Promise.resolve(
        this.opts.window.postMessage(object, this.domain)
      );
    }
    return (Promise.reject('Failed to publish the message'));
  };

  /**
   * Starts listening for incoming message on the current
   * `connection` implementation.
   * Emits a message to a potential parent window to signal
   * that the application is now ready to receive messages.
   */
  Strategy.prototype.listen = function () {
    if (!this.listening) {
      this.connection.addEventListener('message', this.onMessage);
      this.listening = true;
      if (parent) {
        parent.postMessage({
          __pm_strategy: {
            online: true
          }
        }, this.domain);
      }
    }
  };


  /**
   * Stops listening for incoming message on the current
   * `connection` implementation.
   */
  Strategy.prototype.close = function () {
    if (this.listening) {
      this.connection.removeEventListener('message', this.onMessage);
      this.listening = false;
    }
  };

  return (Strategy);
 });