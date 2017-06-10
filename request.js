var checkEvent = function (e) {
  if (!e || !e.data || !e.data.payload
    || !e.data.resource
    || !e.data.method
    || !e.data.type
    || !e.data.transactionId
    || !e.data.caller) {
    throw new Error('Unsupported message');
  }
};

var Request = function (app, e) {
  checkEvent(e);
  this.app           = app;
  this.event         = e;
  this.origin        = e.origin;
  this.path          = e.data.resource;
  this.method        = e.data.method;
  this.payload       = e.data.payload;
  this.transactionId = e.data.trans;
  this.headers       = e.data.headers || {};
  this.caller        = e.data.caller;
};

Request.prototype.get = function (value) {
  return (this.headers[value]);
};
