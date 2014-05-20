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
      this.onUrlChange(url);
    }
  },

  onUrlChange: function () {

  },

  //根据viewid，加载相关view
  loadView: function (viewId, callback) {
    requirejs([this._buildPath(viewId)], $.proxy(function (View) {
      _.callmethod(callback, this, [View]);
    }, this));

  },

  //根据viewId生成路径
  _buildPath: function (viewId) {
    return this.viewMapping[viewId] ? this.viewMapping[viewId] : this.viewRootPath + viewId;
  }












});




















