(function () {

  var window = this;
  var _ = window._;

  // 全局可能用到的变量
  var arr = [];
  var slice = arr.slice;

  var method = method || {};

  /**
   * inherit方法，js的继承，默认为两个参数
   *
   * @param  {function} origin  可选，要继承的类
   * @param  {object}   methods 被创建类的成员，扩展的方法和属性
   * @return {function}         继承之后的子类
   */
  method.inherit = function (origin, methods) {

    // 参数检测，该继承方法，只支持一个参数创建类，或者两个参数继承类
    if (arguments.length === 0 || arguments.length > 2) throw '参数错误';

    var parent = null;

    // 将参数转换为数组
    var properties = slice.call(arguments);

    // 如果第一个参数为类（function），那么就将之取出
    if (typeof properties[0] === 'function')
      parent = properties.shift();
    properties = properties[0];

    // 创建新类用于返回
    function klass() {
      if (_.isFunction(this.initialize))
        this.initialize.apply(this, arguments);
    }

    klass.superclass = parent;

    // 父类的方法不做保留，直接赋给子类
    // parent.subclasses = [];

    if (parent) {
      // 中间过渡类，防止parent的构造函数被执行
      var subclass = function () { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass();

      // 父类的方法不做保留，直接赋给子类
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
              var args = [
                function () {
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
      klass.prototype.initialize = function () { };

    klass.prototype.constructor = klass;

    return klass;
  };

  /**
   * 验证作用域和map，返回函数指针
   *
   * @param  {string}   key   map中的映射对象
   * @param  {object}   scope 执行作用域
   * @return {function}       函数指针
   */
  method.realize = function(key, scope) {
    scope = scope || window;
    if (_.isFunction(key)) return key;
    if (_.isFunction(scope[key])) return scope[key];
    return function () { };
  };


  /**
   * 判断method是不是function，然后在执行作用域中执行方法，类似于call和apply
   *
   * @param  {function} method  函数句柄
   * @param  {object}   scope   执行作用域
   * @param  {array}    params  参数
   * @return {unknown}          执行方法返回值
   */
  method.execute = function (method, scope, params) {
    scope = scope || this;
    if (_.isFunction(method)) {
      return _.isArray(params) ? method.apply(scope, params) : method.call(scope, params);
    }

    return false;
  };

  /**
   * 在fn方法的前后通过键值设置两个传入的回调
   *
   * @param  {function} fn          调用的方法
   * @param  {function} beforeFnKey 在fn之前执行的函数
   * @param  {function} beforeFnKey 在fn之后执行的函数
   * @param  {object}   context     执行上下文
   * @return {unknown}              执行函数的返回值
   */
  method.pack = method.insert = function (fn, beforeFnKey, afterFnKey, context) {

    var scope = context || this;
    var action = _.wrap(fn, function (func) {

      _.execute(_.realize(beforeFnKey, scope), scope);

      func.call(scope);

      _.execute(_.realize(afterFnKey, scope), scope);
    });

    return _.execute(action, scope);
  };

  // //获取url参数
  // //这个方法还是有问题
   method.getUrlParam = function (url, key) {
     if (!url) url = window.location.href;

     var searchReg = /([^&=?]+)=([^&]+)/g;
     var urlReg = /\/+.*\?/;
     var arrayReg = /(.+)\[\]$/;
     var urlParams = {};
     var match, name, value, isArray;

     url = decodeURIComponent(url);
     while (match = searchReg.exec(url)) {
       name = match[1];
       value = match[2];
       isArray = name.match(arrayReg);
       //处理参数为url这种情况
       if (urlReg.test(value)) {
         urlParams[name] = url.substr(url.indexOf(value));
         break;
       } else {
         if (isArray) {
           name = isArray[1];
           urlParams[name] = urlParams[name] || [];
           urlParams[name].push(value);
         } else {
           urlParams[name] = value;
         }
       }
     }

     return key ? urlParams[key] : urlParams;
   };
  // ------------------------------------

  _.extend(_, method);


  if (typeof module === 'object')
    module.exports = _;

}).call(this);