const pathToRegexp = require('./path-to-regexp');

/**
 * @return an array of parameters associated with
 * given resources.
 * @param {*} array an array of resources.
 */
const getParams = function (array) {
  const result = [];
  for (let i = 1, j = 0; i < array.length; ++i) {
    if (array[i][0] === ':') {
      result[j++] = array[i].substr(1);
    }
  }
  return (result);
};

/**
 * The `ResourceManager` handles storage of registered
 * resources in memory.
 */
class ResourceManager {
  
  /**
   * Resource manager constructor.
   */
  constructor() {
    this.resources = {};
  }
  
  /**
   * @return a description of the currently stored resources.
   */
  describe() {
    return (this.resources);
  }

  /**
   * Creates a new resource associated with the given `url`.
   */
  add(url, method, opts) {
    if (typeof this.resources[url] !== 'object') {
      this.resources[url] = {};
      this.resources[url].params = {};
    }
    this.resources[url][method] = {};
    if (opts && opts.description) {
      this.resources[url][method].description = opts.description;
    }
    this.resources[url].params = getParams(pathToRegexp(url).exec(url));
  }

  /**
   * @return a resource associated with the given `url`.
   */
  get(url) {
    return (this.resources[url]);
  }
}

module.exports = ResourceManager;