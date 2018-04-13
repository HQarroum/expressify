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