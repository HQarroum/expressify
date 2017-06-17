/**
 * Description of the local service.
 */
var manifest = {
  emitter: '__query-protocol',
  version: '1.0.0'
};

/**
 * A string representation of a randomly
 * created GUID.
 */
var guid = function () {
  var s4 = function () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};
