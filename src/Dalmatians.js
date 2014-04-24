// @notation 本框架默认是以来于zepto。这里构建了基础的方法层,当用户使用其他框架时，可能需要复写这几个基础方法

// @description 解析event参数的正则
var delegateEventSplitter = /^(\S+)\s*(.*)$/;
// Regular expression used to split event strings.
var eventSplitter = /\s+/;

// ----------------------------------------------------
// @notation 从backbone中借鉴而来，用来多事件绑定的events

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventoperator = function (obj, action, name, rest) {
  if (!name) return true;

  // Handle event maps.
  if (typeof name === 'object') {
    for (var key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
    return false;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, length = names.length; i < length; i++) {
      obj[action].apply(obj, [names[i]].concat(rest));
    }
    return false;
  }

  return true;
};
// ----------------------------------------------------

// @notation 默认使用zepto的事件委托机制
function eventmethod(obj, action, name, callback, context) {
  callback = _.bind(callback, context || this);

  var delegate = function (target, eventName, eventCallback) {
    target.on(eventName, eventCallback);
  };

  var undelegate = function (target, eventName, eventCallback) {
    target.off(eventName, eventCallback);
  };

  var trigger = function (target, eventName) {
    target.trigger(eventName);
  };

  var map = {
    'on': delegate,
    'bind': delegate,
    'off': undelegate,
    'unbind': undelegate,
    'trigger': trigger
  };

  // @notation 需要验证，有问题！
  if (!eventmethod(map, action, name, [callback, context]) || !callback) return this;

  if (_.isFunction(map[action])) {
    map[action](obj || $, name, callback);
  }

}

// @description 选择器
function selectDom(selector) {
  return $(selector);
}

function domImplement($element, action, context, param) {
  if (_.isFunction($element[action]))
    $element[action].apply(context || $element, param);
}

// --------------------------------------------------- //
// ------------------华丽的分割线--------------------- //

// @description 正式的声明Dalmatian框架的命名空间
var Dalmatian = Dalmatian || {};

// @description 定义默认的template方法来自于underscore
Dalmatian.template = _.template;
  Dalmatian.View = _.inherit({
    // @description 构造函数入口
    initialize: function (options) {
      this.__property__();
      this.handlerOption(options);

    },
    // @description 设置默认属性
    __property__: function () {

      var DEFAULT_CONTAINER_TEMPLATE = '<section class="view" id="<%=viewid%>"><%=html%></section>';

      // @description view状态机
      this.statusSet = {};

      this.defaultContainerTemplate = DEFAULT_CONTAINER_TEMPLATE;

      // @override
      // @description template集合，根据status做template的map
      // @example
      //    { 0: '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%});%></ul>' }
      this.templateSet = {};

      this.viewid = _.uniqueId('dalmatian-view-');

    },
    // @description 操作构造函数传入操作
    handlerOption: function (options) {
      // @description 从形参中获取key和value绑定在this上
      if (_.isObject(options)) _.extend(this, options);

    },
    // @description 通过模板和数据渲染具体的View
    // @param status {enum} View的状态参数
    // @param data {object} 匹配View的数据格式的具体数据
    // @param callback {functiion} 执行完成之后的回调
    render: function (status, data, callback) {

      var templateSelected = this.templateSet[status];
      if (templateSelected) {

        try {
          // @description 渲染view
          var templateFn = Dalmatian.template(templateSelected);
          this.html = templateFn(data);

          // @description 在view外层加入外壳
          templateFn = Dalmatian.template(this.defaultContainerTemplate);
          this.html = templateFn({ viewid: this.viewid, html: this.html });

          this.currentStatus = status;

          if (_.isFunction(callback)) {
            _.bind(callback, this);
          }

          return true;

        } catch (e) {

          throw e;

        } finally {

          return false;
        }
      }
    },
    // @override
    // @description 可以被复写，当status和data分别发生变化时候
    // @param status {enum} view的状态值
    // @param data {object} viewmodel的数据
    update: function (status, data) {

      if (!this.currentStatus || this.currentStatus !== status) {
        return this.render(status, data);
      }

      // @override
      // @description 可复写部分，当数据发生变化但是状态没有发生变化时，页面仅仅变化的可以是局部显示
      //              可以通过获取this.html进行修改

    }
  });

  Dalmatian.Adapter = _.inherit({
    // @description 构造函数入口
    initialize: function (options) {
      this.__property__();
      this.handlerOption(options);

    },
    // @override
    // @description 设置默认属性
    __property__: function () {
      this.observers = [];
    },
    // @description 操作构造函数传入操作
    handlerOption: function (options) {
      // @description 从形参中获取key和value绑定在this上
      if (_.isObject(options)) _.extend(this, options);
    },
    // @override
    // @description parse方法用来将datamodel转化为viewmodel，必须被重写
    parse: function () {
      throw Error('方法必须被重写');
    },
    registerObserver: function (viewcontroller) {
      // @description 检查队列中如果没有viewcontroller，从队列尾部推入
      if (!_.contains(this.observers, viewcontroller)) {
        this.observers.push(viewcontroller);
      }
    },
    unregisterObserver: function (viewcontroller) {
      // @description 从observers的队列中剔除viewcontroller
      this.observers = _.without(this.observers, viewcontroller);
    },
    notifyDataChanged: function () {
      // @description 通知所有注册的观察者被观察者的数据发生变化
      _.each(this.observers, function (viewcontroller) {
        if (_.isObject(viewcontroller))
          _.callmethod(viewcontroller.update, viewcontroller);
      });
    }
  });

  Dalmatian.ViewController = _.inherit({
    // @description 构造函数入口
    initialize: function (options) {
      this.__property__();
      this.handlerOption(options);
      this.create();
      this.bind();
    },
    // @override
    // @description 设置默认属性
    __property__: function () {
      this.origindata = {};
    },
    // @description 操作构造函数传入操作
    handlerOption: function (options) {
      this._verifyOpt(options);

      // @description 从形参中获取key和value绑定在this上
      if (_.isObject(options)) _.extend(this, options);
    },
    // @description 验证参数
    _verifyOpt: function (options) {
      if (!_.property('view')(options)) throw Error('view必须在实例化的时候传入ViewController');
    },
    /**
    * @description 传入事件对象，解析之，解析event，返回对象{events: [{target: '#btn', event:'click', callback: handler}]}
    * @param events {obj} 事件对象，默认传入唯一id
    * @param namespace 事件命名空间
    * @return {obj}
    */
    parseEvents: function (events) {

      //用于返回的事件对象
      var eventArr = {};
      //注意，此处做简单的字符串数据解析即可，不做实际业务
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this.view[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this.view);
        eventName += '.delegateEvents' + this.view.viewid;
        eventArr.push({
          target: selector,
          event: eventName,
          method: method
        });
      }
      return eventArr;
    },
    _create: function () {
      var data = this.adapter.parse(this.origindata);
      this.view.render(this.viewstatus, data);
    },
    create: function () {
      // @notation 在create方法调用前后设置onViewBeforeCreate和onViewAfterCreate两个回调
      _.wrapmethod(this._create, 'onViewBeforeCreate', 'onViewAfterCreate', this);

    },
    _bind: function () {
      this.viewcontent = this.view.html;

      var eventsList = this.parseEvents(this.events);

      var scope = this;
      _.each(eventsList, function (item) {
        eventmethod(item.target, 'on', item.event, item.callback, scope);
      });
    },
    bind: function () {
      _.wrapmethod(this._bind, 'onViewBeforeBind', 'onViewAfterBind', this);
    },
    _show: function () {
      var $element = selectDom('#' + this.view.viewid);

      if ((!$element || $element.length === 0) && this.viewcontent) {
        var $container = selectDom(this.container);
        domImplement($container, 'html', false, [this.viewcontent]);
      }

      domImplement($element, 'show');
    },
    show: function () {
      _.wrapmethod(this._show, 'onViewBeforeShow', 'onViewAfterShow', this);
    },
    _hide: function () {
      var $element = selectDom('#' + this.view.viewid);
      domImplement($element, 'hide');
    },
    hide: function () {
      _.wrapmethod(this._hide, 'onViewBeforeHide', 'onViewAfterHide', this);
    },
    _forze: function () {
      var $element = selectDom('#' + this.view.viewid);
      domImplement($element, 'off');
    },
    forze: function () {
      _.wrapmethod(this._forze, 'onViewBeforeForzen', 'onViewAfterForzen', this).call(this);
    },
    _destory: function () {
      var $element = selectDom('#' + this.view.viewid).remove();
      domImplement($element, 'remove');
    },
    destory: function () {
      _.wrapmethod(this._destory, 'onViewBeforeDestory', 'onViewAfterDestory', this).call(this);
    }
  });



