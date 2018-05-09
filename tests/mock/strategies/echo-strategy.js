/**
 * Mock strategy used to allow communication between
 * client and server instances in node.
 */

const EventEmitter = require('events').EventEmitter;
const Request      = require('../../../lib/request');
const Response     = require('../../../lib/response');

/**
 * Wraps the given message and enrich it 
 * with metadata.
 * @param {*} message the message to be wrapped.
 */
const wrap = (message) => ({ data: message });

/**
 * Called back when a new inbound message has
 * been received.
 */
const onMessage = function (message) {
  try {
    this.emit('message', message);
  } catch (e) {
    console.error(e.stack);
  }
};

/**
 * Registers a new subscription.
 * @param {*} resource the resource to associate with
 * the new subscription.
 */
const register = function (resource) {
  // Creating subscription for the resource.
  if (!this.subscribers[resource]) {
    this.subscribers[resource] = { connection: this };
  }
};

/**
 * Unregisters an existing subscription.
 * @param {*} resource the resource associated with
 * the subscription to remove.
 */
const unregister = function (resource) {
  if (!this.subscribers[resource]) return (false);
  // Removing the subscription from memory.
  delete this.subscribers[resource];
  return (true);
};

/**
 * The `echo` strategy implementation.
 */
class Strategy extends EventEmitter {

  /**
   * `echo` strategy constructor,
   * @param {*} opts the options object to be used.
   */
  constructor(opts) {
    super();
    this.opts = opts || {};
    this.subscribers = {};
    this.onMessage = onMessage.bind(this);
  }

  /**
   * Publishes a message to the predefined URL.
   * @param object the expressify object to publish.
   */
  publish(object) {
    if (object.type === 'response') {
      return (Promise.resolve(
        setTimeout(() => this.onMessage(
          wrap(object)
        ), 2 * 100)
      ));
    }
    return (Promise.resolve(this.onMessage(wrap(object))));
  }

  /**
   * Creates a subscription on the resource expressed on the
   * given request object.
   * @param {*} req the expressify request.
   * @param {*} res the expressify response.
   */
  subscribe(req, res) {
    const topic = req.resource;
    // Registering the subscription.
    register.call(this, topic);
    res.send({ topic });
  }

  /**
   * Removes an existing subscription on the resource expressed on the
   * given request object.
   * @param {*} req the expressify request.
   * @param {*} res the expressify response.
   */
  unsubscribe(req, res) {
    const topic = req.resource;
    // Removing the subscription if it exists.
    if (!unregister.call(this, topic)) {
      return res.send(404, { error: 'No such subscription' });
    }
    res.send({ topic });
  }

  /**
   * Called back on a `ping` request.
   * @param {*} req the expressify request.
   * @param {*} res the expressify response.
   */
  ping(req, res) {
    res.send(200);
  }

  /**
   * No-op in this implementation.
   */
  listen() {
    return (Promise.resolve());
  }

  /**
   * No-op in this implementation.
   */
  close() {
    return (Promise.resolve());
  }
};

module.exports = Strategy;