"use strict";

// @description 正式的声明Dalmatian框架的命名空间
var Dalmatian = Dalmatian || {};

// @description 定义默认的template方法来自于underscore
Dalmatian.template = _.template;

Dalmatian.View = _.inherit({

  /**
   * [_initRoot description]
   * 私有方法，根据html生成的dom包装对象
   */
  _initRoot: function () {
    this.root = $(this.defaultContainerTemplate);
    this.root.attr('id', this.viewid);
  },

  /**
   * [_initialize description]
   * 私有方法，设置默认属性
   */
  _initialize: function () {

    var DEFAULT_CONTAINER_TEMPLATE = '<section class="view" id="<%=viewid%>"><%=html%></section>';
    this.defaultContainerTemplate = DEFAULT_CONTAINER_TEMPLATE;

    this.viewid = _.uniqueId('dalmatian-view-');
  },

  /**
   * [initialize description]
   * 构造函数入口，执行实例化时必定会执行initialize方法，
   * 所有初始化的动作，都需要在这里被执行
   * 有两个字段必须被定义，statusSet和templateSet，
   * 用户可以在构造函数执行时传入，也可以在复写initialize时定义
   * 这里的目标是用status做template的map，即status代表了template的映射关系
   *
   * @param  {[object]} options [用户自定义传入的参数]
   */
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);
    this._initRoot();
  },

  /**
   * [handleOptions description]
   * 操作构造函数传入参数，将其绑定在实例对象上
   *
   * @param  {[object]} options [用户自定义传入的参数]
   */
  handleOptions: function (options) {
    // 从形参中获取key和value绑定在this上
    if (_.isObject(options)) _.extend(this, options);

  },

  /**
   * [render description]
   * 根据status的值找到具体的template，加载数据渲染具体的view
   *
   * @param  {[enum]}     status    [View的状态参数]
   * @param  {[object]}   data      [匹配View的数据格式的具体数据]
   * @param  {Function}   callback  [执行完成之后的回调]
   */
  render: function (status, data, callback) {

    var templateSelected = this.templateSet[status];
    if (templateSelected) {

      if (data) {
        // 渲染view
        var templateFn = Dalmatian.template(templateSelected);
        this.html = templateFn(data);
      }else{
        this.html = templateSelected
      }

      this.currentStatus = status;

      _.callmethod(callback, this);

      return this.html;
    }
  },

  /**
   * [update description]
   * 根据view的status变化判断是不是需要重新render，
   * 如果不需要重新render，调用完成之后回调onUpdate方法，
   * onUpdate需要被定义在回调过程中可以使用，用来作为对DOM操作的补充
   *
   * @param  {[enum]} status [view的状态值]
   * @param  {[type]} data   [viewmodel的数据]
   */
  update: function (status, data) {

    if (!this.currentStatus || this.currentStatus !== status) {
      return this.render(status, data);
    }

    // onUpdate是可复写和自定义的部分，当数据发生变化但是状态没有发生变化时，
    // 页面仅仅变化的可以是局部显示，可以通过获取this.html进行修改，
    // 可以使render的操作也可以使对dom的操作
    _.callmethod(this.onUpdate, this, data);
  }
});

Dalmatian.Adapter = _.inherit({

  /**
   * [_initialize description]
   * 私有方法，设置默认属性
   */
  _initialize: function () {
    this.observers = [];
    this.datamodel = {};
  },

  /**
   * [initialize description]
   * 构造函数入口
   *
   * @param  {[object]} options [用户自定义传入的参数]
   */
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);
  },

  /**
   * [handleOptions description]
   * 操作构造函数传入参数，将其绑定在实例对象上
   *
   * @param  {[object]} options [用户自定义传入的参数]
   */
  handleOptions: function (options) {

    // 从形参中获取key和value绑定在this上
    if (_.isObject(options)) _.extend(this, options);
  },

  /**
   * [format description]
   * 需要被重写，format方法承载两个作用
   * 1. 将datamodel格式化到viewmodel，格式化的规则由用户自定义
   * 2. 对datamodel和viewmodel赋值
   *
   * @param  {[object]} data [需要格式化的数据]
   * @return {[object]}      [viewmodel]
   */
  format: function (data) {
    this.datamodel = this.viewmodel = data;
    return this.viewmodel;
  },

  /**
   * [getViewModel description]
   * 调用format方法，格式化datamodel到viewmodel
   *
   * @return {[object]} [viewmodel]
   */
  getViewModel: function () {
    return this.format(this.datamodel);
  },

  /**
   * [registerObserver description]
   * 向观察者队列中添加新的观察者
   *
   * @param  {[ViewController]} viewcontroller [新的观察者]
   */
  registerObserver: function (viewcontroller) {
    // 检查队列中如果没有重复的viewcontroller，从队列尾部推入
    var arr = _.where(this.observers, viewcontroller);
    if (arr.length === 0) {
      this.observers.push(viewcontroller);
    }
  },

  /**
   * [unregisterObserver description]
   * 从观察者队列中剔除特定的观察者
   *
   * @param  {[ViewController]} viewcontroller [特定的需要剔除的观察者]
   */
  unregisterObserver: function (viewcontroller) {
    // 从observers的队列中剔除viewcontroller
    this.observers = _.filter(this.observers, function(item) {
      return item.controllerid !== viewcontroller.controllerid;
    });
  },

  /**
   * [notifyDataChanged description]
   * 通知观察者队列中所有观察者，数据发生变化，调用观察者update接口
   *
   * @return {[type]} [description]
   */
  notifyDataChanged: function () {
    // 通知所有注册的观察者被观察者的数据发生变化
    var data = this.getViewModel();
    _.each(this.observers, function (viewcontroller) {
      if (_.isObject(viewcontroller))
        _.callmethod(viewcontroller.update, viewcontroller, [data]);
    });
  }
});

Dalmatian.ViewController = _.inherit({

  /**
   * [_initialize description]
   * 私有方法，创建不可重复的controllerid
   */
  _initialize: function () {
    this.controllerid = _.uniqueId('dalmatian-controller-');
  },

  /**
   * [_handleAdapter description]
   * 处理dataAdpter中的datamodel，为其注入view的默认容器数据
   */
  _handleAdapter: function () {
    if (this.adapter) {
      this.adapter.registerObserver(this);
    }
  },

  /**
   * [_verify description]
   * 验证用户是不是提供了必要的参数
   *
   * @param  {[object]} options [用户自定义传入的参数]
   */
  _verify: function (options) {

    // underscore 1.6版本提供_.property接口
    if (!_.property('view')(options) && (!this.view))
      throw Error('view必须在实例化的时候传入ViewController');

    if (!_.property('viewstatus')(options) && (!this.viewstatus))
      throw Error('ViewController初始化时必须获得viewstatus值');
  },

  /**
   * [_create description]
   * 私有方法，创建根元素的dom结构
   *
   * @return {[type]} [description]
   */
  _create: function () {
    this.render();

    //render结束后构建根元素dom结构
    if (_.isObject(this.view)){
      this.$el = this.view.root;
    }
  },

  /**
   * [handleOptions description]
   * 操作构造函数传入参数，将其绑定在实例对象上
   *
   * @param  {[object]} options [用户自定义传入的参数]
   */
  handleOptions: function (options) {
    if (options) {
      this._verify(options);

      // 从形参中获取key和value绑定在this上
      if (_.isObject(options))
        _.extend(this, options);
    };
  },

  /**
   * [initialize description]
   * 初始化ViewController，建立controllerid，设置adapter作为controller的被观察者
   * 传入的一些参数：
   * 1. container 用户设置的容器选择器或者dom结构，可选
   * 2. view ViewController管理的view，必须
   * 3. adapter 渲染view需要的适配器，可选
   * 4. viewstatus 初始化view的状态值定义，必须
   * controller创建$el元素
   *
   * @param  {[object]} options [用户自定义传入的参数]
   */
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);
    this._handleAdapter();
    this.create();
  },

  // @deprecated
  // 直接设置viewstatus的值就可以了，这个接口很多余
  // setViewStatus: function (status) {
  //   this.viewstatus = status;
  // },

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

    if (_.isObject(this.view)) {
      this.view.render(this.viewstatus, this.adapter && this.adapter.getViewModel());
      this.view.root.html(this.view.html);
    }
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