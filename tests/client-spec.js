const _ = require('lodash');
const should = require('should');
const Expressify = require('../');
const echoStrategy = new (require('./mock/strategies/echo-strategy'))();

/**
 * Expressify server used to implement the
 * test scenario.
 */
const server = new Expressify.Server({ strategy: echoStrategy });

/**
 * Used as callback references.
 */
const dummyFunction_1 = () => {};
const dummyFunction_2 = () => {};

/**
 * The methods we are running tests against.
 */
const methods = ['get', 'post', 'put', 'patch', 'head', 'delete', 'options'];

/**
 * Handles requests from the below client.
 */
server.use(function (req, res) {
  if (req.resource === '/echo') {
    return res.send(req.serialize());
  } else if (req.resource === '/404') {
    return res.send(404);
  } else if (req.resource === '/subscriptions') {
    return res.send(req.app.subscribers);
  }
});

/**
 * Start listening.
 */
server.listen();

/**
 * Expressify test plan.
 */
describe('Expressify Client', function() {

  /**
   * Expressify client instance.
   */
  const client = new Expressify.Client({
    url: 'http://foo.com',
    strategy: echoStrategy
  });

  /**
   * Client options enforcements.
   */
  it('should throw when missing or invalid parameters have been given', function () {
    (function () {
      new Expressify.Client();
    }).should.throw('An options object with a valid strategy was expected');
  });

  /**
   * Client attributes initialization.
   */
  it('should have properly initialized attributes', function () {
    client.subscribers.should.eql({});
  });

  /**
   * Expressify client prototype.
   */
  it('should expose a proper API', function () {
    client.should.have.a.property('describe').which.is.a.Function();
    client.should.have.a.property('request').which.is.a.Function();
    client.should.have.a.property('subscribe').which.is.a.Function();
    methods.forEach((method) => {
      client.should.have.a.property(method).which.is.a.Function();
    });
  });

  /**
   * Expressify client request with multiple methods.
   */
  it('should be able to issue a request using different methods', function (done) {
    let counter     = 0;
    const reference = {
      resource: '/echo',
      payload: {},
      type: 'request'
    };

    methods.forEach((method) => {
      client[method](reference.resource).then((res) => {
        counter = counter + 1;
        res.caller.emitter.should.eql('__expressify_server');
        res.code.should.eql(200);
        res.payload.method.should.eql(method);
        _.isMatch(res.payload, reference).should.be.true();
        counter === methods.length && done();
      }, (err) => {
        done(new Error(`Request failed with ${err.stack}`));
      });
    });
  });

  /**
   * Expressify client request with payload.
   */
  it('should be able to issue a request carrying a payload', function (done) {
    let counter     = 0;
    const reference = {
      resource: '/echo',
      payload: {
        foo: 'bar'
      },
      type: 'request'
    };

    methods.forEach((method) => {
      client[method](reference.resource, {
        data: reference.payload
      }).then((res) => {
        counter = counter + 1;
        res.code.should.eql(200);
        _.isMatch(res.payload, reference).should.be.true();
        counter === methods.length && done();
      }, (err) => {
        done(new Error(`Request failed with ${err.stack}`));
      });
    });
  });

  /**
   * Expressify client request with query parameters.
   */
  it('should be able to issue a request carrying query parameters', function (done) {
    let counter     = 0;
    const reference = {
      resource: '/echo',
      payload: {},
      type: 'request'
    };

    methods.forEach((method) => {
      client[method]('/echo?foo=bar').then((res) => {
        counter = counter + 1;
        res.code.should.eql(200);
        _.isMatch(res.payload, reference).should.be.true();
        counter === methods.length && done();
      }, (err) => {
        done(new Error(`Request failed with ${err.stack}`));
      });
    });
  });

  /**
   * Expressify client timeout.
   */
  it('should be able to timeout when no response is received', function (done) {
    let counter = 0;

    this.timeout(4 * 1000);
    methods.forEach((method) => {
      client[method]('/do-not-respond', { timeout: 3 * 1000 }).then((res) => {
        done(new Error(`Request should have timeout`));
      }, (err) => {
        counter = counter + 1;
        counter === methods.length && done();
      });
    });
  });

  /**
   * Expressify server error reporting.
   */
  it('should be able to report errors returned by the server while resolving the request promise', function (done) {
    let counter = 0;

    methods.forEach((method) => {
      client[method]('/404').then((res) => {
        counter = counter + 1;
        res.code.should.eql(404);
        counter === methods.length && done();
      }, (err) => {
        done(new Error(`Request failed with ${err.stack}`));
      });
    });
  });

  /**
   * Expressify client resource subscription interface.
   */
  it('should be able to subscribe to a remote resource', function (done) {
    client.subscribe('/topic/foo', dummyFunction_1)
      .then(() => client.subscribe('/topic/foo', dummyFunction_2))
      .then(() => client.get('/subscriptions'))
      .then((res) => {
        Object.keys(client.subscribers['/topic/foo'] || []).length.should.eql(2);
        Object.keys(res.payload['/topic/foo'] || {}).length.should.eql(1);
        done();
      }, (err) => {
        done(new Error(`Request failed with ${err.stack}`));
      });
  });

  /**
   * Expressify client resource unsubscription interface.
   */
  it('should be able to unsubscribe from a remote resource', function (done) {
    client.unsubscribe('/topic/foo', dummyFunction_1)
      .then(() => client.unsubscribe('/topic/foo', dummyFunction_2))
      .then(() => client.get('/subscriptions'))
      .then((res) => {
        Object.keys(client.subscribers['/topic/foo']).length.should.eql(0);
        Object.keys(res.payload['/topic/foo'] || {}).length.should.eql(0);
        done();
      }, (err) => {
        done(new Error(`Request failed with ${err.stack}`));
      });
  });

  /**
   * Expressify client resource unsubscription rejection.
   */
  it('should be able to reject an invalid unsubscription request', function (done) {
    client.unsubscribe('/foo', dummyFunction_1)
      .then(() => done(new Error('Should have rejected the promise')), (err) => {
        done();
      });
  });
});