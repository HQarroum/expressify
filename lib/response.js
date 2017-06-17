var Response = function (app, e) {
  this.app           = app;
  this.headers       = {};
  this.payload       = {};
  this.transactionId = e.data.transactionId;
};

Response.prototype.send = function (code, data) {
  this.code = code;
  if (data) {
    this.payload = data;
  }
  this.app.connection.postMessage({
    headers: this.headers,
    payload: this.payload,
    transactionId: this.transactionId,
    code: this.code
  }, '*');
};
