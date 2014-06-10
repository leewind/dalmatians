"use strict";
var Application = _.inherit({

  //设置默认的属性
  defaultPropery: function () {

    //存储view队列的hash对象，这里会新建一个hash数据结构，暂时不予理睬
    this.views = {};

    //默认索引view
    this.indexView = 'index';

    //是否创建基本框架dom结构
    this.isCreate = false;

    //当前view
    this.curView;

    //最后访问的view
    this.lastView;

    //各个view的映射地址
    this.viewMapping = {};

    //本地维护History逻辑，暂时不予关注
    this.history = [];

    //是否开启路由监控
    this.isListeningRoute = false;

    //view的根目录
    this.viewRootPath = 'views/';

    //当前对应url请求
    this.request = {};

    //当前对应的参数
    this.query = {};

    this.wrapper = $('body');

    //pushState的支持能力
    this.hasPushState = !!(this.history && this.history.pushState);

    //由用户定义的获取viewid规则
    this.getViewIdRule = function (url, hasPushState) {
      return _.getUrlParam(url, 'viewId');
    };

    //用户定义根据viewId设置url的规则
    this.setUrlRule = function (viewId, hasPushState) {
      var loc = window.location.href;
      var url = loc.indexOf('?') ? (loc.substr(0, loc.indexOf('?')) + '?viewId=' + viewId) : (loc + '?viewId=' + viewId);
      history.pushState('', {}, url);
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
    //    $(window).bind('hashchange', _.bind(this.onURLChange, this));
    $(window).bind('popstate', _.bind(this.onURLChange, this));
  },

  //当URL变化时
  onURLChange: function (e) {
    if (!this.isListeningRoute) return;

    //点击浏览器后退，会触发后退
    this.switchView();
  },

  startListeningRoute: function () {
    this.isListeningRoute = true;
  },

  stopListeningRoute: function () {
    this.isListeningRoute = false;
  },

  //解析的当前url，并且根据getViewIdRules生成当前viewID
  parseUrl: function () {
    var url = '', viewId, query;
    url = window.location.href;
    query = _.getUrlParam(url);
    viewId = this.getViewIdRule(url);
    if (!_.isString(viewId)) viewId = this.indexView;

    this.request = {
      viewId: viewId,
      path: url,
      query: query
    };
    console.log(this.request)
  },

  //创建基础dom框架
  createViewPort: function () {
    if (this.isCreate) return;

    this.mainframe = $([
      '<div id="main">',
          '<div id="main-viewport"></div>',
      '</div>'
    ].join(''));

    this.viewport = this.mainframe.find('#main-viewport');
    this.wrapper.empty().append(this.mainframe);
    this.isCreate = true;
  },

  //入口点
  start: function () {
    //构建主视口dom结构
    this.createViewPort();

    //首次不会触发路由监听，直接程序导入
    this.switchView();

  },

  //根据viewId判断当前view是否实例化
  viewExist: function (viewId) {
    return typeof this.views[viewId] !== 'undefined';
  },

  //根据viewid，加载view的类，并会实例化
  //注意，这里只会返回一个view的实例，并不会显示或者怎样，也不会执行app的逻辑
  loadView: function (viewId, callback) {

    //每个键值还是在全局views保留一个存根，若是已经加载过便不予理睬
    if (this.viewExist(viewId)) {
      _.execute(callback, this, this.views[viewId]);
      return;
    }

    requirejs([this._buildPath(viewId)], $.proxy(function (View) {
      var view = new View();

      this.views[viewId] = view;

      //将当前view实例传入，执行回调
      _.execute(callback, this, view);

    }, this));
  },

  //根据viewId生成路径
  _buildPath: function (viewId) {
    return this.viewMapping[viewId] ? this.viewMapping[viewId] : this.viewRootPath + viewId;
  },

  //注意，此处的url可能是id，也可能是其它莫名其妙的，这里需要进行解析
  forward: function (viewId) {

    //每个键值还是在全局views保留一个存根，若是已经加载过便不予理睬
    if (this.viewExist(viewId) && viewId == this.curView.viewId) {
      return;
    }

    //用户行为导致view切换，暂时关闭url监控
    this.stopListeningRoute();

    this.setUrlRule(viewId);

    //解析viewId逻辑暂时省略
    //......
    this.switchView();

    setTimeout($.proxy(function () {
      this.startListeningRoute();
    }, this), 20)

  },

  //后退操作
  back: function (viewId) {

    if (history.length == 1 && !viewId) {
      viewId = this.indexViewId;
    }

    if (viewId) {
      //这里需要记录
      //this.forwardType = 'back'
      this.forward(this.indexView);
    } else {
      history.back();
    }

  },

  //view切换，传入要显示和隐藏的view实例
  switchView: function () {
    //处理view前，得先处理当前request对象，这里传入只是一个id，我们得解析出request对象
    this.parseUrl();

    //若是要切换的view就是当前view视为刷新操作
    //

    this.loadView(this.request.viewId, function (view) {
      this.lastView = this.curView;
      this.curView = view;

      if (this.curView) this.curView.show();
      if (this.lastView) this.lastView.hide();

    });
  }

});