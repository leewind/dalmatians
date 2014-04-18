var Dalmatian = Dalmatian || {};

Dalmatian.View = (function() {
  var View = function(options) {
    this.viewid = _.uniqueId('dalmatian-view');
    this.options = options || {};
  }

  var methods = {};

  View.STATUS_CANCEL = 0;
  View.STATUS_SUCCESS = 1;
  View.STATUS_FAIL = 2;

  methods.templateSet = {
    0: '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%});%></ul><div><button id="cancelBtn">取消</button></div>',
    1: '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%});%></ul><div><button id="confirmBtn">确定</button></div>',
    2: '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%});%></ul><div><button id="failedBtn" disabled>失败</button></div>'
  }

  methods.render = function(status, data, callback) {
    var templateSource = this.templateSet[status];
    if (templateSource) {
      var templateFn = _.template(templateSource);

      try{
        this.html = '<div class="view" id="'+this.viewid+'">'+templateFn(data)+'</div>';
      }catch(e){
        throw Error('template parse error');
      }

    };

    if (_.isFunction(callback)) {
      _.bind(this, callback);
    }
  };

  _.extend(View.prototype, methods);

  return View;
})(window);

Dalmatian.Adapter = (function() {
  var Adapter = function(options) {
    this.options = options || {};
  };

  var methods = {};

  methods.parse = function(origindata) {
    return {list: origindata.cities};
  };

  // @description 观察者内部实现
  methods.notifyDataChanged = function() {};

  _.extend(Adapter.prototype, methods);

  return Adapter;
})(window);

Dalmatian.ViewController = (function(){
  var ViewController = function(options) {

    this.options = options;

    if (_.isObject(options)) {
      this.view = options.view;
      this.adapter = options.adapter;
    }

    this.container = $('body');

    // _.bind(this, this.initialize);
    this.initialize.call(this);

  };

  var methods = {};

  methods.initialize = function() {
    this.show();
  };

  methods.show = function() {
    if (_.isFunction(this.onViewBeforeShow)) {
      // _.bind(this, this.onViewBeforeShow);
      this.onViewBeforeShow.call(this);
    }

    var data = this.adapter.parse(this.origindata);
    this.view.render(this.viewstatus, data);
    this.container.append(this.view.html);

    if (_.isFunction(this.onViewAfterShow)) {
      // _.bind(this, this.onViewAfterShow);
      this.onViewAfterShow.call(this);
    }
  }

  methods.onViewBeforeShow = function() {
    this.viewstatus = Dalmatian.View.STATUS_SUCCESS;
    this.origindata = {
      cities: [
        { name: '上海', id: 1 },
        { name: '北京', id: 2 }
      ]
    }
  };

  methods.onViewAfterShow = function() {

  }

  _.extend(ViewController.prototype, methods);

  return ViewController;
})(window);


var cview = new Dalmatian.View();
var cadapter = new Dalmatian.Adapter();

var cviewcontroller = new Dalmatian.ViewController({
  view: cview,
  adapter: cadapter
});