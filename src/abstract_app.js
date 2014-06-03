"use strict";
var Application = _.inherit({

  //设置默认的属性
  defaultPropery: function () {

    //存储view队列的hash对象，这里会新建一个hash数据结构，暂时不予理睬
    this.views = new _.Hash();

    //当前view
    this.curView;

    //最后访问的view
    this.lastView;

    //各个view的映射地址
    this.viewMapping = {};

    //本地维护History逻辑
    this.history = [];

    //是否开启路由监控 
    this.isListeningRoute = false;

    //view的根目录
    this.viewRootPath = 'app/views/';

    //当前对应url请求
    this.request = {};

    //当前对应的参数
    this.query = {};

    //pushState的支持能力
    this.hasPushState = !!(this.history && this.history.pushState);

    //由用户定义的获取viewid规则
    this.getViewIdRules = function (url, hasPushState) {
      return _.getUrlParam(url, 'viewId');
    };

  },

  //@override
  handleOptions: function (opts) {
    _.extend(this, opts);
  },

  initialize: function (opts) {

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
    $(window).bind('hashchange', _.bind(this.onURLChange, this));

  },

  //当URL变化时
  onURLChange: function () {
    if (!this.isListeningRoute) return;

  },

  startListeningRoute: function () {
    this.isListeningRoute = true;
  },

  stopListeningRoute: function () {
    this.isListeningRoute = false;
  },

  //解析的当前url，并且根据getViewIdRules生成当前viewID
  parseUrl: function (url) {

  },

  //入口点
  start: function () {
    var url = decodeURIComponent(window.location.hash.replace(/^#+/i, '')).toLowerCase();
    this.history.push(window.location.href);
    //处理当前url，会将viewid写入request对象
    this.parseUrl(url);

    var viewId = this.request.viewId;

    //首次不会触发路由监听，直接程序导入
    this.switchView(viewId);

  },

  //根据viewId判断当前view是否实例化
  viewExist: function (viewId) {
    return this.views.exist(viewId);
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

  //后退操作
  back: function () {

  },

  //view切换，传入要显示和隐藏的view实例
  switchView: function (viewId) {
    if (!viewId) return;

    this.loadView(viewId, function (view) {
      this.lastView = this.curView;
      this.curView = view;

      if (this.curView) this.curView.show();
      if (this.lastView) this.lastView.show();

    });
  }

});