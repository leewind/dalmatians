(function () {

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
  method.inherit = function () {

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
      var subclass = function () { };
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
          value = (function (methodName, fn) {
            return function () {
              var scope = this;
              var args = [function () {
                return ancestor[methodName].apply(scope, arguments);
              } ];
              return fn.apply(this, args.concat(slice.call(arguments)));
            };
          })(k, value);
        }
      }

      //此处对对象进行扩展，当前原型链已经存在该对象，便进行扩展
      if (_.isObject(klass.prototype[k]) && _.isObject(value) && (typeof klass.prototype[k] != 'function' && typeof value != 'fuction')) {
        //原型链是共享的，这里不好办
//        var temp = {};
//        _.extend(temp, klass.prototype[k]);
//        _.extend(temp, value);
//        klass.prototype[k] = temp;

        klass.prototype[k] = _.extend({}, klass.prototype[k], value);


      } else {
        klass.prototype[k] = value;
      }

    }

    if (!klass.prototype.initialize)
      klass.prototype.initialize = function () { };

    klass.prototype.constructor = klass;

    return klass;
  };

  // @description 返回需要的函数
  method.getNeedFn = function (key, scope) {
    scope = scope || window;
    if (_.isFunction(key)) return key;
    if (_.isFunction(scope[key])) return scope[key];
    return function () { };
  };

  method.callmethod = function (method, scope, params) {
    scope = scope || this;
    if (_.isFunction(method)) {
      method.apply(scope, params);
      return true;
    }

    return false;
  };

  /**
  * @description 在fn方法的前后通过键值设置两个传入的回调
  * @param fn {function} 调用的方法
  * @param beforeFnKey {string} 从context对象中获得的函数指针的键值，该函数在fn前执行
  * @param afterFnKey {string} 从context对象中获得的函数指针的键值，该函数在fn后执行
  * @param context {object} 执行环节的上下文
  * @return {function}
  */
  method.wrapmethod = method.insert = function (fn, beforeFnKey, afterFnKey, context) {

    var scope = context || this;
    var action = _.wrap(fn, function (func) {

      _.callmethod(_.getNeedFn(beforeFnKey, scope), scope);

      func.call(scope);

      _.callmethod(_.getNeedFn(afterFnKey, scope), scope);
    });

    return _.callmethod(action, scope);
  }


  _.extend(_, method);

})(window);