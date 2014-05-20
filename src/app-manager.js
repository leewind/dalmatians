"use strict";


var Application = _.inherit({

  //设置默认的属性
  defaultPropery: function () {

    //存储view队列的hash对象，这里会新建一个hash数据结构，暂时不予理睬
    this.views = {};

    //当前view
    this.curView;

    //最后访问的view
    this.lastView;

    //动画api
    this.animApi;

    //本地维护History逻辑
    this.history = [];

    //是否开启路由监控 
    this.isListeningRoute = false;

    //viewid以及其链接地址的映射
    this.viewMapping = {};

    //view的根目录
    this.viewRootPath = 'app/views/';

    this.animAPIs = {};
    this.animatName = 'no';

  },

  //@override
  handleOptions: function (opts) {
    _.extend(this, opts);
  },

  initializ: function (opts) {

    this.defaultPropery();
    this.handleOptions(opts);

    //构造系统各个事件
    this.buildEvent();

    //首次动态调用，生成view
    this.start();
  },

  buildEvent: function () {
    this._requireEvent();
    this._routeEvent();

  },

  _requireEvent: function () {
    requirejs.onError = function (e) {
      if (e && e.requireModules) {
        for (var i = 0; i < e.requireModules.length; i++) {
          console.log('抱歉，当前的网络状况不给力，请刷新重试!');
          break;
        }
      }
    };
  },

  //路由相关处理逻辑，可能是hash，可能是pushState
  _routeEvent: function () {

    //默认使用pushState逻辑，否则使用hashChange，后续出pushState的方案
    $(window).bind('hashchange', _.bind(this.start, this));

  },

  //入口点
  start: function () {
    var url = decodeURIComponent(window.location.hash.replace(/^#+/i, '')).toLowerCase();
    this.history.push(window.location.href);

    //首次不会触发路由监听，直接程序导入
    if (!this.isListeningRoute) {
      this.loadViewByUrl(url);
    }
  },

  loadViewByUrl: function (url) {

    //将url解析，解析出viewid，解析逻辑暂时忽略

    var viewId = url;

    this.switchView(viewId);


  },

  //根据viewId判断当前view是否实例化
  viewExist: function (viewId) {

    return false;
  },


  //根据viewid，加载view的类，并会实例化
  //注意，这里只会返回一个view的实例，并不会显示或者怎样，也不会执行app的逻辑
  loadView: function (viewId, callback) {

    //每个键值还是在全局views保留一个存根，若是已经加载过便不予理睬
    if (this.viewExist(viewId)) {
      _.callmethod(callback, this, this.views.get(viewId));
      return;
    }

    requirejs([this._buildPath(viewId)], $.proxy(function (View) {
      var view = new View();

      this.views.push(viewId, view);

      //将当前view实例传入，执行回调
      _.callmethod(callback, this, view);

    }, this));
  },

  //根据viewId生成路径
  _buildPath: function (viewId) {
    return this.viewMapping[viewId] ? this.viewMapping[viewId] : this.viewRootPath + viewId;
  },

  //注意，此处的url可能是id，也可能是其它莫名其妙的，这里需要进行解析
  forward: function (viewId) {

    //解析viewId逻辑暂时省略
    //......

    this.switchView(viewId);

  },

  //view切换，传入要显示和隐藏的view实例
  switchView: function (viewId) {
    if (!viewId) return;

    //    this.loadView();


    this.loadView(viewId, function (view) {
      this.lastView = this.curView;
      this.curView = view;

      //这里消去动画逻辑

    });

  },

  //传入两个view的实例，这里会封装动画
  startAnimation: function (inView, outView) {
    if (!inView) return;

    //若是存在outView就需要动画，否则直接显示即可

    if (!outView) { inView.show(); this._onSwitchEnd(inView);  return; }

    var switchFn = this.animAPIs[this.animatName];

    if (switchFn) {
      switchFn(inView, outView, $.proxy(function (inView, outView) {
        this._onSwitchEnd(inView, outView);
      }, this));
    } else {
      this._onSwitchEnd(inView, outView);
    }

  },

  //统一处理切换结束的逻辑
  _onSwitchEnd: function (inView, outView) {
    outView.hide();
    inView.show();

  },


  //根据viewId显示一个view
  showView: function (id, callback) {
    if (!id) return;
    this.loadView(id, function (view) {

      //view自动会触发各个关于show的事件
      view.show();

    });

  },

  //根据viewId隐藏一个view
  hideView: function (id, callback) {
    if (!id) return;

    this.loadView(id, function (view) {

      //view自动会触发各个关于show的事件
      view.hide();

    });

  }














});




















