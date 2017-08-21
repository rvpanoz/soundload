/**
 *
 * the lib global
 * @class lib
 * @singleton
 */
var lib = {
  UNKNOWN: 0,
  BROWSER: 1,
  NODE: 2,
  WORKER: 3,
  NODE_WEBKIT: 4,
  env: 0, //takes value from above enumeration

  /**
   * converts any javascript variable to its JSON representation
   * @param {Object} obj
   * @returns {String}
   * */
  encode: function(obj, replacer, space) {
    return JSON.stringify(obj, replacer, space);
  },
  /**
   * parses a JSON string to its object representation
   * @param {String} str
   * @param {Boolean} safe if true, will not throw exception
   * @returns {Object}
   */
  decode: function(str, safe) {
    try {
      return JSON.parse(str);
    } catch (e) {
      if (safe !== true) throw e;
      return {};
    }
  },
  capitalize:function(string, all) {
    if(all) return string.toUpperCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  /**
   * The empty function, useful for undefined callbacks etc
   * @returns {undefined}
   */
  emptyFn: function() {},
  callServer: function(opts) {
    var request = require('request');
    var opts = opts || {},
      options = {};

    options.url = opts.url || null,
    options.method = opts.method || 'GET';

    if (options.method === 'POST') {
      var data = opts.data;
      var headers = {
        'User-Agent': 'request'
      }
      _.extend(options, {
        headers: headers,
        body: data,
        json: true
      });
    }

    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        opts.success(body);
      }
    });
  }

};

(function(root, factory) {
  var env;
  if (typeof window != 'undefined')
    if (typeof process == 'undefined') env = lib.BROWSER;
    else env = lib.NODE;
  else if (typeof process != 'undefined') env = lib.NODE;
  else if (typeof WorkerGlobalScope != 'undefined') env = lib.WORKER;
  else env = lib.UNKNOWN;

  if (env == lib.NODE) {
    module.exports = factory(root, env);
  } else factory(root, env);

})(this, function(root, env) {
  lib.env = env;
  lib.root = root;
  return lib;
});
