const _ = require('lodash');
const should = require('should');
const Expressify = require('../lib/expressify');

/**
 * Expressify test plan.
 */
describe('Expressify', function() {

  /**
   * Expressify prototype.
   */
  it('should expose a client and server instance', function () {
    Expressify.should.have.a.property('Client').which.is.a.Function();
    Expressify.should.have.a.property('Server').which.is.a.Function();
  });
});