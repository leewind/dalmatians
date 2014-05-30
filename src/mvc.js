"use strict";

// ------------------华丽的分割线--------------------- //

// @description 正式的声明Dalmatian框架的命名空间
var Dalmatian = Dalmatian || {};

// @description 定义默认的template方法来自于underscore
Dalmatian.template = _.template;
Dalmatian.View = _.inherit({
  // @description 构造函数入口
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);
    this._initRoot();

  },

  _initRoot: function () {
    //根据html生成的dom包装对象
    //有一种场景是用户的view本身就是一个只有一个包裹器的结构，他不想要多余的包裹器
    this.root = $(this.defaultContainerTemplate);
    this.root.attr('id', this.viewid);
  },

  // @description 设置默认属性
  _initialize: function () {

    var DEFAULT_CONTAINER_TEMPLATE = '<section class="view" id="<%=viewid%>"><%=html%></section>';

    // @description view状态机
    // this.statusSet = {};

    this.defaultContainerTemplate = DEFAULT_CONTAINER_TEMPLATE;

    // @override
    // @description template集合，根据status做template的map
    // @example
    //    { 0: '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%});%></ul>' }
    // this.templateSet = {};

    this.viewid = _.uniqueId('dalmatian-view-');

  },

  // @description 操作构造函数传入操作
  handleOptions: function (options) {
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

      // @description 渲染view
      var templateFn = Dalmatian.template(templateSelected);
      this.html = templateFn(data);

      // 这里减少一次js编译
      // this.root.html('');
      // this.root.append(this.html);

      this.currentStatus = status;

      _.callmethod(callback, this);

      return this.html;

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
    _.callmethod(this.onUpdate, this, data);
  }
});

Dalmatian.Adapter = _.inherit({

  // @description 构造函数入口
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);

  },

  // @description 设置默认属性
  _initialize: function () {
    this.observers = [];
    //    this.viewmodel = {};
    this.datamodel = {};
  },

  // @description 操作构造函数传入操作
  handleOptions: function (options) {
    // @description 从形参中获取key和value绑定在this上
    if (_.isObject(options)) _.extend(this, options);
  },

  // @override
  // @description 设置
  format: function (datamodel) {
    return datamodel;
  },

  getViewModel: function () {
    return this.format(this.datamodel);
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

  //统一设置所有观察者的状态，因为对应观察者也许根本不具备相关状态，所以这里需要处理
//  setStatus: function (status) {
//    _.each(this.observers, function (viewcontroller) {
//      if (_.isObject(viewcontroller))
//        viewcontroller.setViewStatus(status);
//    });
//  },

  notifyDataChanged: function () {
    // @description 通知所有注册的观察者被观察者的数据发生变化
    var data = this.getViewModel();
    _.each(this.observers, function (viewcontroller) {
      if (_.isObject(viewcontroller))
        _.callmethod(viewcontroller.update, viewcontroller, [data]);
    });
  }
});

Dalmatian.ViewController = _.inherit({

  _initialize: function () {

    //用户设置的容器选择器，或者dom结构
    this.container;
    //根元素
    this.$el;

    //一定会出现
    this.view;
    //可能会出现
    this.adapter;
    //初始化的时候便需要设置view的状态，否则会渲染失败，这里给一个默认值
    this.viewstatus = 'init';

  },

  // @description 构造函数入口
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);
    this._handleAdapter();
    this.create();
  },

  //处理dataAdpter中的datamodel，为其注入view的默认容器数据
  _handleAdapter: function () {
    //不存在就不予理睬
    if (!this.adapter) return;
    this.adapter.registerObserver(this);
  },

  // @description 操作构造函数传入操作
  handleOptions: function (options) {
    if (!options) return;

    this._verify(options);

    // @description 从形参中获取key和value绑定在this上
    if (_.isObject(options)) _.extend(this, options);
  },

  setViewStatus: function (status) {
    this.viewstatus = status;
  },

  // @description 验证参数
  _verify: function (options) {
    //这个underscore方法新框架在报错
    //    if (!_.property('view')(options) && (!this.view)) throw Error('view必须在实例化的时候传入ViewController');
    if (options.view && (!this.view)) throw Error('view必须在实例化的时候传入ViewController');
  },

  // @description 当数据发生变化时调用onViewUpdate，如果onViewUpdate方法不存在的话，直接调用render方法重绘
  update: function (data) {

    //    _.callmethod(this.hide, this);

    if (this.onViewUpdate) {
      _.callmethod(this.onViewUpdate, this, [data]);
      return;
    }
    this.render();

    //    _.callmethod(this.show, this);
  },

  /**
  * @override
  */
  render: function () {
    // @notation  这个方法需要被复写
    this.view.render(this.viewstatus, this.adapter && this.adapter.getViewModel());
    this.view.root.html(this.view.html);
  },

  _create: function () {
    this.render();

    //render 结束后构建好根元素dom结构
    this.view.root.html(this.view.html);
    this.$el = this.view.root;
  },

  create: function () {

    //l_wang这块不是很明白
    //是否检查映射关系，不存在则recreate，但是在这里dom结构未必在document上
    //    if (!$('#' + this.view.viewid)[0]) {
    //      return _.callmethod(this.recreate, this);
    //    }

    // @notation 在create方法调用前后设置onViewBeforeCreate和onViewAfterCreate两个回调
    _.wrapmethod(this._create, 'onViewBeforeCreate', 'onViewAfterCreate', this);

  },

  /**
  * @description 如果进入create判断是否需要update一下页面，sync view和viewcontroller的数据
  */
  _recreate: function () {
    this.update();
  },

  recreate: function () {
    _.wrapmethod(this._recreate, 'onViewBeforeRecreate', 'onViewAfterRecreate', this);
  },

  //事件注册点
  bindEvents: function () {
    var events = this.events;

    if (!(events || (events = _.result(this, 'events')))) return this;
    this.unBindEvents();

    // @description 解析event参数的正则
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    var key, method, match, eventName, selector;

    //注意，此处做简单的字符串数据解析即可，不做实际业务
    for (key in events) {
      method = events[key];
      if (!_.isFunction(method)) method = this[events[key]];
      if (!method) continue;

      match = key.match(delegateEventSplitter);
      eventName = match[1], selector = match[2];
      method = _.bind(method, this);
      eventName += '.delegateEvents' + this.view.viewid;

      if (selector === '') {
        this.$el.on(eventName, method);
      } else {
        this.$el.on(eventName, selector, method);
      }
    }

    return this;
  },

  //取消所有事件
  unBindEvents: function () {
    this.$el.off('.delegateEvents' + this.view.viewid);
    return this;
  },

  _show: function () {
    this.bindEvents();
    $(this.container).append(this.$el);
    this.$el.show();
  },

  show: function () {
    _.wrapmethod(this._show, 'onViewBeforeShow', 'onViewAfterShow', this);
  },

  _hide: function () {
    this.forze();
    this.$el.hide();
  },

  hide: function () {
    _.wrapmethod(this._hide, 'onViewBeforeHide', 'onViewAfterHide', this);
  },

  _forze: function () {
    this.unBindEvents();
  },

  forze: function () {
    _.wrapmethod(this._forze, 'onViewBeforeForzen', 'onViewAfterForzen', this);
  },

  _destory: function () {
    this.unBindEvents();
    this.$el.remove();
    //    delete this;
  },

  destory: function () {
    _.wrapmethod(this._destory, 'onViewBeforeDestory', 'onViewAfterDestory', this);
  }
});