const _ = require('lodash');
const should = require('should');
const Expressify = require('../lib/expressify');
const echoStrategy = new (require('./mock/strategies/echo-strategy'))();

/**
 * Expressify client used to implement the
 * test scenario.
 */
const client = new Expressify.Client({
  url: 'http://foo.com',
  strategy: echoStrategy
});

/**
 * The methods we are running tests against.
 */
const methods = ['get', 'post', 'put', 'patch', 'head', 'delete', 'options'];

/**
 * Expressify test plan.
 */
describe('Expressify Server', function() {

  /**
   * Expressify server instance.
   */
  let server = null;

  /**
   * We create a new server instance for each test.
   */
  beforeEach(() => {
    server = new Expressify.Server({ strategy: echoStrategy }).listen();
  });

  /**
   * We close the server instance after each test.
   */
  afterEach(function() {
    server.close();
  });

  /**
   * Client attributes initialization.
   */
  it('should have properly initialized attributes', function () {
    server.subscribers.should.eql({});
  });

  /**
   * Expressify server prototype.
   */
  it('should expose a proper API', function () {
    server.should.have.a.property('use').which.is.a.Function();
    server.should.have.a.property('register').which.is.a.Function();
    server.should.have.a.property('publish').which.is.a.Function();
    server.should.have.a.property('listen').which.is.a.Function();
    server.should.have.a.property('close').which.is.a.Function();
    methods.forEach((method) => {
      server.should.have.a.property(method).which.is.a.Function();
    });
  });

  /**
   * Expressify middleware registration.
   */
  it('should allow to register a request middleware', function (done) {
    server.use((req, res, next) => {
      should.exist(req);
      should.exist(res);
      (typeof next === 'function').should.be.true();
      done();
    });
    client.get('/foo');
  });

  /**
   * Expressify middleware registration using method names.
   */
  it('should allow to register a request middleware using a method name', function (done) {
    let counter = 0;

    // Registering server middlewares.
    methods.forEach((method) => {
      server[method]('/foo', (req, res, next) => {
        res.send(200);
      });
    });

    // Calling server middlewares.
    methods.forEach((method) => {
      client[method]('/foo').then((res) => {
        counter = counter + 1;
        res.code.should.eql(200);
        counter === methods.length && done();
      }, (err) => {
        done(new Error(`Request failed with ${err.stack}`));
      });
    });
  });

  /**
   * Expressify middleware registration using resource pattern.
   */
  it('should allow to register a request middleware using a resource pattern', function (done) {
    const id = '1';

    server.get('/user/:id', (req, res) => {
      req.params.id.should.eql(id);
      done();
    });
    client.get(`/user/${id}`);
  });

  /**
   * Request query objects consumption.
   */
  it('should allow middlewares to consume request query objects', function (done) {
    const id = '1';

    server.get('/user', (req, res) => {
      req.query.id.should.eql(id);
      done();
    });
    client.get(`/user?id=${id}`);
  });

  /**
   * Request headers consumption.
   */
  it('should allow middlewares to consume request headers', function (done) {
    const id = '1';

    server.get('/user', (req, res) => {
      req.headers.id.should.eql(id);
      done();
    });
    client.get(`/user`, {
      headers: { id }
    });
  });

  /**
   * Expressify middleware registration consuming request query objects.
   */
  it('should allow middlewares to reply using .send() and specify a status code using .statusCode()', function (done) {
    // Empty .send().
    server.get('/foo', (req, res) => res.send())
    // .send() with a status code.
    .get('/bar', (req, res) => res.send(200))
    // .send() with a payload.
    .get('/baz', (req, res) => res.send({ foo: 'bar' }))
    // using .statusCode()
    .get('/qux', (req, res) => res.statusCode(200).send());

    // Verifying that each request returns a 200 status code.
    Promise.all([
      client.get(`/foo`),
      client.get('/bar'),
      client.get('/baz'),
      client.get('/qux')
    ]).then((array) => {
      array.forEach((res) => {
        res.code.should.eql(200);
      });
      done();
    });
  });

  /**
   * Expressify middleware order specification.
   */
  it('should be able to meet the chain order specification', function (done) {
    let counter = 0;

    // Registering middleware chain.
    server.use((req, res, next) => {
      counter = counter + 1;
      next();
    }).get('/foo', (req, res) => {
      counter = counter + 1;
    }).use((req, res) => {
      counter = counter + 1;
      counter.should.eql(4);
      done();
    });

    // Calling both valid and invalid resources
    // to go through the chain.
    client.get('/foo').then(client.get('/invalid'));
  });

  /**
   * Expressify server publish interface.
   */
  it('should be able to publish events and dispatch them to subscribers', function (done) {
    const payload = { foo: 'bar' };

    client.subscribe('/foo', (e) => {
      e.payload.should.eql(payload);
      done();
    }).then((res) => {
      res.code.should.eql(200);
      server.publish('/foo', payload);
    });
  });

  /**
   * Expressify server resources description.
   */
  it('should be able to return the description of the registered resources', function (done) {
    const description = {
      '/description': { params: [], get: {} },
      '/foo': { params: [], get: {}, post: {} },
      '/user/:id': { params: [ 'id' ], get: {} },
      '/bar': { params: [], get: {} }
    };

    // Registering resources.
    server.get('/foo', () => {})
      .post('/foo', () => {})
      .get('/user/:id', () => {})
      .get('/bar', () => {});
    
    // Retrieving the server resource description.
    client.describe().then((res) => {
      res.payload.should.eql(description);
      done();
    });
  });
});