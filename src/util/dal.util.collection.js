// @author michael.lee
// @see http://requirejs.org/docs/api.html
// @see https://github.com/jashkenas/underscore
// @description 从underscore.js代码中摘取部分的方法操作collection

define(function(require, exports, modules) {

  var util = util || {};
  util.object = require('dal.util.object');

  var breaker = {};

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  exports.each = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = util.object.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

});