/**
 * Mock strategy used to allow communication between
 * client and server instances in node.
 */

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

/**
 * Library dependencies.
 */
const Request  = require('../../../lib/request');
const Response = require('../../../lib/response');

/**
 * Wraps the given message and enrich it 
 * with metadata.
 * @param {*} message 
 */
const wrap = function (message) {
  return ({
    data: message,
    strategy: new Strategy({
      server: true,
      parent: this
    }),
    origin: 'null'
  });
};

/**
 * Called back when a new inbound message has
 * been received.
 */
const onMessage = function (message) {
  try {
    (this.opts.parent ? this.opts.parent : this).emit('message', message);
  } catch (e) {
    console.error(e.stack);
  }
};

/**
 * The query protocol client constructor.
 */
const Strategy = function (opts) {
  EventEmitter.call(this);
  this.opts = opts || {};
  this.onMessage = onMessage.bind(this);
  this.wrapper = wrap.bind(this);
};

/**
 * Event emitter prototype inheritance.
 */
util.inherits(Strategy, EventEmitter);

/**
 * Publishes a message to the predefined URL.
 */
Strategy.prototype.publish = function (object) {
  if (!this.opts.parent) {
    return (Promise.resolve(
      setTimeout(() => this.onMessage(
        this.wrapper(Request.from(null, this.wrapper(object)))
      ), 2 * 100)
    ));
  }
  this.onMessage(this.wrapper(object));
};

/**
 * Starts listening for incoming message on the current
 * `connection` implementation.
 */
Strategy.prototype.listen = function () {
  // Nothing to do.
};

/**
 * Stops listening for incoming message on the current
 * `connection` implementation.
 */
Strategy.prototype.close = function () {
  // Nothing to do.
};

module.exports = Strategy;