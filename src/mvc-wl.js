"use strict";
/*
@notation 本框架默认是以来于zepto。这里构建了基础的方法层,当用户使用其他框架时，可能需要复写这几个基础方法

淳敏，上次说了直接使用zepto，你记得么，所以我对这里代码做了一定整理

1 现在viewController在实例化时候，只是形成了dom结构对象，没有载入document，名字给换成$el了
2 我现在将所有var定义的变量上浮至了函数开始
3 合并了parse以及formatData
因为在初始化时候，继承者可以默认向datamodel注入默认值，但是一调用format就掉了，一些时候还不一定需要传入data
而，我们这里的viewmodel一定要经过datamodel生成，所以使用datamodel原生数据组合viewmodel的接口
最后因为format操作datamodel生成的data就是viewdata，然后这个家伙被传递走了，所以viewdata变量反而失去了意义
4 这里去掉了selectDom方法，在viewController加入了find方法，用于查找当前节点下的view
5 去掉了domImplement，这些api是由于不使用zepto而存在，使用了的话我就搞掉了。。。。。。
6 每次绑定事件前，我这里还是先移除了事件再调用，所以你在hide时候清理，有可以使用相关方法
7 有些不太会被外部用的事件点我给取消了，比如事件注册一块，有需要再加上
8 viewController的容器改名叫了root，并且view中也存在一个root
9 若是一小点数据的改变却会引起整个dom结构的重组，这一点我感觉不好，于是对view提出了一个容器的概念，你看是否合理
所谓容器，不过是有模板嵌套的场景，后加载出来的html需要放入之前的某一个位置
若是子模板改变只会改变对应部分的dom、若是主模板改变就只能全部dom重组，这个会在status中设置选择器


改动有点大，不对你就骂

*/

// --------------------------------------------------- //
// ------------------华丽的分割线--------------------- //

// @description 正式的声明Dalmatian框架的命名空间
var Dalmatian = Dalmatian || {};

// @description 定义默认的template方法来自于underscore
Dalmatian.template = _.template;
Dalmatian.View = _.inherit({

  // @description 设置默认属性
  _initialize: function () {

    var DEFAULT_CONTAINER_TEMPLATE = '<div class="view"></div>';
    var VIEW_ID = 'dalmatian-view-';

    // @override
    // @description template集合，根据status做template的map
    // @example
    /*
    {
    init: '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%});%></ul>'//若是字符串表明全局性
    ajaxLoading: 'loading',
    ajaxSuc: 'success'
    }
    */
    this.templateSet = {};

    // @override
    /*
    ***这块我没有考虑清楚，一般情况下view是不需要在改变的，若是需要改变其实该设置到datamodel中***
    这个可以考虑默认由viewController注入给dataModel，然后后面就可操作了......
    这里的包裹器可能存在一定时序关系，这块后续再整理

    与模板做映射关系，每个状态的模板对象可能对应一个容器，默认为根容器，后期可能会被修改
    ajaxLoading: el,
    ajaxSuc: selector
    */
    this.wrapperSet = {};

    this.viewid = _.uniqueId(VIEW_ID);
    this.currentStatus = null;
    this.defaultContainer = DEFAULT_CONTAINER_TEMPLATE;
    this.isNoWrapper = false;

    //全局根元素
    this.root = null;
    //当前包裹器
    this.curWrapper = null;
    //当前模板对应解析后的html结构

  },

  _initRoot: function () {
    //根据html生成的dom包装对象
    //有一种场景是用户的view本身就是一个只有一个包裹器的结构，他不想要多余的包裹器
    if (!this.isNoWrapper) {
      this.root = $(this.defaultContainer);
      this.root.attr('id', this.viewid);
    }
  },

  // @description 构造函数入口
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);
    this._initRoot();

  },

  // @override
  // @description 操作构造函数传入操作
  handleOptions: function (options) {
    // @description 从形参中获取key和value绑定在this上
    // l_wang options可能不是纯净的对象，而是函数什么的，这样需要注意
    if (_.isObject(options)) _.extend(this, options);

  },

  //处理包裹器，暂时不予理睬
  _handleNoWrapper: function (html) {
    //...不予理睬
  },

  //根据状态值获取当前包裹器
  _getCurWrapper: function (status, data) {
    //处理root不存在的情况
    this._handleNoWrapper();

    //若是以下逻辑无用，那么这个便是根元素
    if (!data.wrapperSet || !data.wrapperSet[status]) { return this.root; }
    if (_.isString(data.wrapperSet[status])) { return this.root.find(data.wrapperSet[status]); }

  },

  // @description 通过模板和数据渲染具体的View
  // @param status {enum} View的状态参数
  // @param data {object} 匹配View的数据格式的具体数据
  // @param callback {functiion} 执行完成之后的回调
  render: function (status, data, callback) {

    var templateFn, wrapper;
    var template = this.templateSet[status];

    //默认将view中设置的默认wrapper注入值datamodel，datamodel会带入viewModel
    wrapper = this._getCurWrapper(status, data);

    if (!wrapper[0]) throw '包裹器参数错误';
    if (!template) return false;

    //解析当前状态模板，编译成函数
    templateFn = Dalmatian.template(template);
    wrapper.html(templateFn(data));
    this.html = wrapper;

    this.currentStatus = status;

    _.callmethod(callback, this);
    return true;

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
    _.callmethod(this.onUpdate, this);
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
  // @description 操作datamodel返回一个data对象形成viewmodel
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

  setStatus: function (status) {
    _.each(this.observers, function (viewcontroller) {
      if (_.isObject(viewcontroller))
        viewcontroller.setViewStatus(status);
    });
  },

  unregisterObserver: function (viewcontroller) {
    // @description 从observers的队列中剔除viewcontroller
    this.observers = _.without(this.observers, viewcontroller);
  },

  notifyDataChanged: function () {
    // @description 通知所有注册的观察者被观察者的数据发生变化
    //    this.viewmodel = this.format(this.datamodel);
    var data = this.getViewModel();
    _.each(this.observers, function (viewcontroller) {
      if (_.isObject(viewcontroller))
        _.callmethod(viewcontroller.update, viewcontroller, [data]);
    });
  }
});

Dalmatian.ViewController = _.inherit({

  // @description 构造函数入口
  initialize: function (options) {
    this._initialize();
    this.handleOptions(options);

    //处理datamodel
    this._handleDataModel();
    this.create();
  },

  // @description 默认属性设置点，根据该函数，我可以知道该类具有哪些this属性
  _initialize: function () {

    //用户设置的容器选择器，或者dom结构
    this.containe;
    //根元素
    this.$el;
    //默认容器
    this.root = $('body');

    //一定会出现
    this.view;
    //可能会出现
    this.adapter;
    //初始化的时候便需要设置view的状态，否则会渲染失败，这里给一个默认值
    this.viewstatus = 'init';

  },

  setViewStatus: function (status) {
    this.viewstatus = status;
  },

  // @description 操作构造函数传入操作
  handleOptions: function (options) {
    if (!options) return;

    this._verify(options);

    // @description 从形参中获取key和value绑定在this上
    if (_.isObject(options)) _.extend(this, options);
  },

  //处理dataAdpter中的datamodel，为其注入view的默认容器数据
  _handleDataModel: function () {
    //不存在就不予理睬
    if (!this.adapter) return;
    this.adapter.datamodel.wrapperSet = this.view.wrapperSet;
    this.adapter.registerObserver(this);
  },

  // @description 验证参数
  _verify: function (options) {
    //这个underscore方法新框架在报错
    //    if (!_.property('view')(options) && (!this.view)) throw Error('view必须在实例化的时候传入ViewController');
    if (options.view && (!this.view)) throw Error('view必须在实例化的时候传入ViewController');
  },

  // @description 当数据发生变化时调用onViewUpdate，如果onViewUpdate方法不存在的话，直接调用render方法重绘
  update: function (data) {

    //这样虽然减少回流，但会隐藏页面跳动
    //    _.callmethod(this.hide, this);

    if (!_.callmethod(this.onViewUpdate, this, [data])) {
      this.render();
    }

    //    _.callmethod(this.show, this);
  },

  /**
  * @override
  *
  */
  render: function () {
    // @notation  这个方法需要被复写
    // var data = this.adapter.format(this.origindata);
    this.view.render(this.viewstatus, this.adapter && this.adapter.getViewModel());
  },

  // @description 返回基于当前view下的某节点
  find: function (selector) {
    if (!this.$el) return null;
    return this.$el.find(selector);
  },

  _create: function () {
    this.render();

    //render 结束后构建好根元素dom结构
    this.$el = $(this.view.html);
  },

  create: function () {

    //l_wang 这段代码没有看懂************
    //    var $element = this.find(this.view.viewid);
    //    if ($element) return _.callmethod(this.recreate, this);
    //l_wang 这段代码没有看懂************

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
  bindEvents: function (events) {
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
    this.root = $(this.container);
    this.root.append(this.$el);
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