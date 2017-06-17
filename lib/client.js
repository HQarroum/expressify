/**
 * Called back when a new inbound message is
 * received.
 */
var onClientMessage = function (message) {
  try {
    var response = new Response(this, message);
    this.emit('response', 'success', response);
  } catch (e) {
    //console.log(e.stack);
  }
};

/**
 * The query protocol client constructor.
 */
var QueryClient = function (opts) {
  Emitter.apply(this);
  this.opts = opts || {};
  this.onClientMessage = onClientMessage.bind(this);
  this.connection = this.opts.connection || window;
  this.connection.addEventListener('message', this.onClientMessage);
};

/**
 * Prototype inheritence.
 */
QueryClient.prototype = Object.create(Emitter.prototype);

QueryClient.prototype.request = function (object) {
  var id = guid();
  object.opts = object.opts || {};
  return new Promise(function (resolve, reject) {
    try {
      this.once('response', function (type, response) {
        return (type === 'success' ? resolve(response) : reject(response));
      });
      this.connection.postMessage({
        method: object.method,
        resource: object.url,
        payload: object.opts.data || {},
        transactionId: id,
        headers: object.opts.headers || {},
        caller: 'foo'
      }, '*');
    } catch (e) {
      return (reject(e));
    }
  }.bind(this));
};

/**
 * Registers helper method in the `QueryClient` class for
 * each action.
 */
['get', 'post', 'patch', 'put', 'head', 'delete'].forEach(function (method) {
  QueryClient.prototype[method] = function (url, opts) {
    return this.request({
      method: method,
      url: url,
      opts: opts
    });
  };
});
