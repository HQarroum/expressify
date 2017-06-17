var getParams = function (array) {
  var result = [];

  for (var i = 1, j = 0; i < array.length; ++i) {
    if (array[i][0] === ':') {
      result[j++] = array[i].substr(1);
    }
  }
  return (result);
};

var ResourceManager = function () {
  this.resources = {};
};

/**
 * @return a description of the currently stored resources.
 */
ResourceManager.prototype.describe = function () {
  return (this.resources);
};

/**
 * Creates a new resource associated with the given `url`.
 */
ResourceManager.prototype.add = function (url, method) {
  if (typeof this.resources[url] !== 'object') {
    this.resources[url] = {};
    this.resources[url][method] = {};
    this.resources[url].params = {};
  }
  this.resources[url].params = getParams(pathToRegexp(url).exec(url));
};

/**
 * @return a resource associated with the given `url`.
 */
ResourceManager.prototype.get = function (url) {
  return (this.resources[url]);
};
