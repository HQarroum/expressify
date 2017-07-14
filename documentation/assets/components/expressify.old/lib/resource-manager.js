 /**
  * Exporting the `ResourceManager` module appropriately given
  * the environment (AMD, Node.js and the browser).
  */
 (function (name, definition) {
    if (typeof define === 'function' && define.amd) {
        // Defining the module in an AMD fashion.
        define(['./path-to-regexp'], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // Exporting the module for Node.js/io.js.
        module.exports = definition(require('./path-to-regexp'));
    } else {
        var gl       = this;
        var instance = definition(gl.pathToRegexp);
        var old      = gl[name];

        /**
         * Allowing to scope the module
         * avoiding global namespace pollution.
         */
        instance.noConflict = function () {
            gl[name] = old;
            return instance;
        };
        // Exporting the module in the global
        // namespace in a browser context.
        gl[name] = instance;
    }
 })('ExpressifyResourceManager', function (pathToRegexp) {

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
  ResourceManager.prototype.add = function (url, method, opts) {
    if (typeof this.resources[url] !== 'object') {
      this.resources[url] = {};
      this.resources[url].params = {};
    }
    this.resources[url][method] = {};
    if (opts && opts.description) {
      this.resources[url][method].description = opts.description;
    }
    this.resources[url].params = getParams(pathToRegexp(url).exec(url));
  };

  /**
   * @return a resource associated with the given `url`.
   */
  ResourceManager.prototype.get = function (url) {
    return (this.resources[url]);
  };

  return (ResourceManager);
 });