// @author michael.lee
// @see http://requirejs.org/docs/api.html
// @see https://github.com/jashkenas/underscore
// @description

define(function(require, exports, modules) {

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  exports.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

});