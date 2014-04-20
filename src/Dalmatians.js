var Dalmatian = Dalmatian || {};

// @description 定义默认的template方法来自于underscore
Dalmatian.template = _.template;

// @description 定义默认的选择器为$
Dalmatian.selector = $;

// @notation 需要写这部分内容记住留下super
var arr = [];
var slice = arr.slice;

/**
* @description inherit方法，js的继承，默认为两个参数
* @param {function} supClass 可选，要继承的类
* @param {object} subProperty 被创建类的成员
* @return {function} 被创建的类
*/
Dalmatian.inherit = function () {

  // @description 参数检测，该继承方法，只支持一个参数创建类，或者两个参数继承类
  if (arguments.length == 0 || arguments.length > 2) throw '参数错误';

  var parent = null;

  // @description 将参数转换为数组
  var properties = slice.call(arguments);

  // @description 如果第一个参数为类（function），那么就将之取出
  if (typeof properties[0] === 'function')
    parent = properties.shift();
  properties = properties[0];

  // @description 创建新类用于返回
  function klass() {
    this.initialize.apply(this, arguments);
  }

  klass.superclass = parent;
  klass.subclasses = [];

  if (parent) {
    // @description 中间过渡类，防止parent的构造函数被执行
    var subclass = function () { };
    subclass.prototype = parent.prototype;
    klass.prototype = new subclass;
    parent.subclasses.push(klass);
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

    klass.prototype[k] = value;
  }

  if (!klass.prototype.initialize)
    klass.prototype.initialize = function () { };

  klass.prototype.constructor = klass;

  return klass;
};



Dalmatian.Util = {
  callmethod: function(method, scope, params){
    scope = scope || this;

    if (_.isFunction(method)) method.apply(scope, params);
  }
};

Dalmatian.View = (function() {

  var View = function(options) {
    // @description view的唯一id
    this.viewid = _.uniqueId('dalmatian-view-');

     // @description 默认的view的外壳，class定义为view，id为view的唯一id
    this.defaultContainerTemplate = this.defaultContainerTemplate || '<section class="view" id="<%=viewid%>"><%=html%></section>';

    // @override
    // @description View的状态定义
    // @example
    //    { STATUS_SUCCESS: 0 }
    this.statusSet = {};

    // @description 从形参中获取key和value绑定在this上
    if (_.isObject(options)) _.extend(this, options);
  };

  // @notation 看看是不是可以prototype用inherit来代替，至少要有$super的概念
  View.extend = _.extend;

  var methods = {};

  // @override
  // @description template集合，根据status做template的map
  // @example
  //    { 0: '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%});%></ul>' }
  methods.templateSet = {};

  // @description 通过模板和数据渲染具体的View
  // @param status {enum} View的状态参数
  // @param data {object} 匹配View的数据格式的具体数据
  // @param callback {functiion} 执行完成之后的回调
  methods.render = function(status, data, callback) {

    var templateSelected = this.templateSet[status];
    if (templateSelected) {

      try{
        // @description 渲染view
        var templateFn = Dalmatian.template(templateSelected);
        this.html = templateFn(data);

        // @description 在view外层加入外壳
        templateFn = Dalmatian.template(this.defaultContainerTemplate);
        this.html = templateFn({viewid: this.viewid, html: this.html});

        this.currentStatus = status;

        if (_.isFunction(callback)) {
          _.bind(this, callback);
        }

        return true;

      }catch(e){

        throw e;

      }finally{

        return false;
      }
    }
  };

  // @override
  // @description 可以被复写，当status和data分别发生变化时候
  // @param status {enum} view的状态值
  // @param data {object} viewmodel的数据
  methods.update = function(status, data) {

    if (!this.currentStatus || this.currentStatus!==status) {
      return this.render(status, data);
    }

    // @override
    // @description 可复写部分，当数据发生变化但是状态没有发生变化时，页面仅仅变化的可以是局部显示
    //              可以通过获取this.html进行修改

  };

  _.extend(View.prototype, methods);

  return View;

})(window);

Dalmatian.Adapter = (function() {

  var Adapter = function() {
    this.observers = [];
  };

  var methods = {};

  // @override
  // @description parse方法用来将datamodel转化为viewmodel，必须被重写
  methods.parse = function() {
    throw Error('方法必须被重写');
  };

  methods.registerObserver = function(viewcontroller) {
    // @description 检查队列中如果没有viewcontroller，从队列尾部推入
    if (!_.contains(this.observers, viewcontroller)) {
      this.observers.push(viewcontroller);
    }
  };

  methods.unregisterObserver = function(viewcontroller) {
    // @description 从observers的队列中剔除viewcontroller
    this.observers = _.without(this.observers, viewcontroller);
  };

  methods.notifyDataChanged = function() {
    // @description 通知所有注册的观察者被观察者的数据发生变化
    _.each(this.observers, function(viewcontroller){
      if (_.isObject(viewcontroller))
        Dalmatian.Util.callmethod(viewcontroller.update, viewcontroller);
    });
  };

  _.extend(Adapter.prototype, methods);

})(window);

Dalmatian.ViewController = (function(){

  var ViewController = function(options){
    if (_.property('view')(options)) throw Error('view必须在实例化的时候传入ViewController');

    this.view = options.view;
    this.adapter = options.adapter;
  };

  var methods = {};

  methods.create = function(){
    Dalmatian.Util.callmethod(this.view.onViewBeforeCreate, this);

    var data = this.adapter.parse(this.origindata);
    this.view.render(this.viewstatus, data);

    Dalmatian.Util.callmethod(this.view.onViewAfterCreate, this);
  };

  methods.bind = function(){
    Dalmatian.Util.callmethod(this.view.onViewBeforeBind, this);

    // @notation Dalmatian.Event需要创建，参考Backbone
    this.viewcontent = this.html;
    Dalmatian.Event.on(this.viewcontent, this.events);

    Dalmatian.Util.callmethod(this.view.onViewAfterBind, this);
  };

  // @override
  // @description 如果没有attach上去就append或者html，如果
  methods.attach = function(view){};

  methods.show = function(){
    Dalmatian.Util.callmethod(this.view.onViewBeforeShow, this);

    // @description 调用attach方法将this.viewcontent贴到container
    Dalmatian.Util.callmethod(this.attach, this, [this.viewcontent]);

    Dalmatian.Util.callmethod(this.view.onViewAfterCreate, this);
  };

  method.hide = function(){

  };

})(window);