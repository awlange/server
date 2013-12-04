/*
 * Cache container object for static text files
 *
 * Adrian Lange 12/2013
 */

var Cache = (function () {

  function Cache() {
    this.index = "";
    this.css = "";
    this.js = "";
  };

  Cache.prototype.getIndex = function() {
    return this.index;
  };

  Cache.prototype.getCss = function() {
    return this.css;
  };

  Cache.prototype.getJs = function() {
    return this.js;
  };

  Cache.prototype.setIndex = function(index) {
    this.index = index;
  };

  Cache.prototype.setCss = function(css) {
    this.css = css;
  };

  Cache.prototype.setJs = function(js) {
    this.js = js;
  };

  return Cache;
})();

exports.Cache = Cache;
