(function() {

  var window = this;

  var _ = window._;
  if (typeof require === 'function') {
    _ = require('underscore');
  };

  // @description 全局可能用到的变量
  var arr = [];
  var slice = arr.slice;

  var method = method || {};


  /**
   * @description inherit方法，js的继承，默认为两个参数
   * @param {function} supClass 可选，要继承的类
   * @param {object} subProperty 被创建类的成员
   * @return {function} 被创建的类
   */
  method.inherit = function() {

    // @description 参数检测，该继承方法，只支持一个参数创建类，或者两个参数继承类
    if (arguments.length === 0 || arguments.length > 2) throw '参数错误';

    var parent = null;

    // @description 将参数转换为数组
    var properties = slice.call(arguments);

    // @description 如果第一个参数为类（function），那么就将之取出
    if (typeof properties[0] === 'function')
      parent = properties.shift();
    properties = properties[0];

    // @description 创建新类用于返回
    function klass() {
      if (_.isFunction(this.initialize))
        this.initialize.apply(this, arguments);
    }

    klass.superclass = parent;
    // parent.subclasses = [];

    if (parent) {
      // @description 中间过渡类，防止parent的构造函数被执行
      var subclass = function() {};
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass();
      // parent.subclasses.push(klass);
    }

    var ancestor = klass.superclass && klass.superclass.prototype;
    for (var k in properties) {
      var value = properties[k];

      //满足条件就重写
      if (ancestor && typeof value == 'function') {
        var argslist = /^\s*function\s*\(([^\(\)]*?)\)\s*?\{/i.exec(value.toString())[1].replace(/\s/i, '').split(',');
        //只有在第一个参数为$super情况下才需要处理（是否具有重复方法需要用户自己决定）
        if (argslist[0] === '$super' && ancestor[k]) {
          value = (function(methodName, fn) {
            return function() {
              var scope = this;
              var args = [
                function() {
                  return ancestor[methodName].apply(scope, arguments);
                }
              ];
              return fn.apply(this, args.concat(slice.call(arguments)));
            };
          })(k, value);
        }
      }

      //此处对对象进行扩展，当前原型链已经存在该对象，便进行扩展
      if (_.isObject(klass.prototype[k]) && _.isObject(value) && (typeof klass.prototype[k] != 'function' && typeof value != 'fuction')) {
        //原型链是共享的，这里不好办
        var temp = {};
        _.extend(temp, klass.prototype[k]);
        _.extend(temp, value);
        klass.prototype[k] = temp;
      } else {
        klass.prototype[k] = value;
      }

    }

    if (!klass.prototype.initialize)
      klass.prototype.initialize = function() {};

    klass.prototype.constructor = klass;

    return klass;
  };

  // @description 返回需要的函数
  method.getNeedFn = function(key, scope) {
    scope = scope || window;
    if (_.isFunction(key)) return key;
    if (_.isFunction(scope[key])) return scope[key];
    return function() {};
  };

  method.callmethod = function(method, scope, params) {
    scope = scope || this;
    if (_.isFunction(method)) {
      return _.isArray(params) ? method.apply(scope, params) : method.call(scope, params);
    }

    return false;
  };

  //获取url参数
  method.getUrlParam = function(url, name) {
    var i, arrQuery, _tmp, query = {};
    var index = url.lastIndexOf('//');
    var http = url.substr(index, url.length);

    url = url.substr(0, index);
    arrQuery = url.split('&');

    for (i = 0, len = arrQuery.length; i < len; i++) {
      _tmp = arrQuery[i].split('=');
      if (i == len - 1) _tmp[1] += http;
      query[_tmp[0]] = _tmp[1];
    }

    return name ? query[name] : query;
  };


  /**
   * @description 在fn方法的前后通过键值设置两个传入的回调
   * @param fn {function} 调用的方法
   * @param beforeFnKey {string} 从context对象中获得的函数指针的键值，该函数在fn前执行
   * @param afterFnKey {string} 从context对象中获得的函数指针的键值，该函数在fn后执行
   * @param context {object} 执行环节的上下文
   * @return {function}
   */
  method.wrapmethod = method.insert = function(fn, beforeFnKey, afterFnKey, context) {

    var scope = context || this;
    var action = _.wrap(fn, function(func) {

      _.callmethod(_.getNeedFn(beforeFnKey, scope), scope);

      func.call(scope);

      _.callmethod(_.getNeedFn(afterFnKey, scope), scope);
    });

    return _.callmethod(action, scope);
  };

  method.hash = method.inherit({
    inisilize: function(opts) {
      this.keys = [];
      this.values = [];
    },

    length: function() {
      return this.keys.length;
    },

    //传入order，若是数组中存在的话会将之放到最后，保证数组的唯一性，因为这个是hash，不能存在重复的键
    push: function(key, value, order) {
      if (_.isObject(key)) {
        for (var i in key) {
          if (key.hasOwnProperty(i)) this.push(i, key[i], order);
        }
        return;
      }

      var index = _.indexOf(key, this.keys);

      if (index != -1 && !order) {
        this.values[index] = value;
      } else {
        if (order) this.remove(key);
        this.keys.push(key);
        this.vaules.push(value);
      }

    },

    remove: function(key) {
      return this.removeByIndex(_.indexOf(key, this.keys));
    },

    removeByIndex: function(index) {
      if (index == -1) return this;

      this.keys.splice(index, 1);
      this.values.splice(index, 1);

      return this;
    },

    pop: function() {
      if (!this.length()) return;

      this.keys.pop();
      return this.values.pop();
    },

    //根据索引返回对应键值
    indexOf: function(value) {
      var index = _.indexOf(value, this.vaules);
      if (index != -1) return this.keys[index];
      return -1;
    },

    //移出栈底值
    shift: function() {
      if (!this.length()) return;

      this.keys.shift();
      return this.values.shift();
    },

    //往栈顶压入值
    unShift: function(key, vaule, order) {
      if (_.isObject(key)) {
        for (var i in key) {
          if (key.hasOwnProperty(i)) this.unShift(i, key[i], order);
        }
        return;
      }
      if (order) this.remove(key);
      this.keys.unshift(key);
      this.vaules.unshift(value);
    },

    //返回hash表的一段数据
    //
    slice: function(start, end) {
      var keys = this.keys.slice(start, end || null);
      var values = this.values.slice(start, end || null);
      var hash = new _.Hash();

      for (var i = 0; i < keys.length; i++) {
        hash.push(keys[i], values[i]);
      }

      return obj;
    },

    //由start开始，移除元素
    splice: function(start, count) {
      var keys = this.keys.splice(start, end || null);
      var values = this.values.splice(start, end || null);
      var hash = new _.Hash();

      for (var i = 0; i < keys.length; i++) {
        hash.push(keys[i], values[i]);
      }

      return obj;
    },

    exist: function(key, value) {
      var b = true;

      if (_.indexOf(key, this.keys) == -1) b = false;

      if (!_.isUndefined(value) && _.indexOf(value, this.values) == -1) b = false;

      return b;
    },


    filter: function() {

    }
  });

  _.extend(_, method);


  if (typeof module === 'object')
    module.exports = _;

}).call(this);