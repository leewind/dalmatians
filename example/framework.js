var Dalmatian = {};

var View = function() {

}

View.prototype.render = function(template, data) {
  var templateFn = _.template(template);
  return templateFn(data);
};

// @description create方法创建dom
View.prototype.create = function() {
  if (_.isFunction(this.onCreate)) {
    _.bind(this.onCreate, this);
  }
};

// @description show将dom append到页面上
View.prototype.show = function() {
  if (_.isFunction(this.onShow)) {
    _.bind(this.onShow, this);
  }
};

// @description load绑定events
View.prototype.load = function() {
  if (_.isFunction(this.onLoad)) {
    _.bind(this.onLoad, this);
  }
};

// @description 冻结所有的events
View.prototype.frozen = function() {
  if (_.isFunction(this.onFrozen)) {
    _.bind(this.onFrozen, this);
  }
};

// @description 隐藏dom
View.prototype.hide = function() {
  if (_.isFunction(this.onHide)) {
    _.bind(this.onHide, this);
  }
};

// @description 销毁dom
View.prototype.destory = function() {
  if (_.isFunction(this.onDestory)) {
    _.bind(this.onDestory, this);
  }
};

// @description 重启view进入
View.prototype.restart = function() {
  if (_.isFunction(this.onRestart)) {
    _.bind(this.onRestart, this);
  }
};

Dalmatian.View = View;

var Adapter = function(origin){
  this.origin = origin;
  this.observers = [];
};

Adapter.prototype.parse = function() {
  throw Error('parse original data to view model');
};

Adapter.prototype.notifyDataChanged = function() {
  _.each(this.observers, function(viewcontroller){
    viewcontroller.updateView();
  });
};

Adapter.prototype.registerObserver = function(viewcontroller) {
  if (!_.contains(this.observers, viewcontroller)) {
    this.observers.push(viewcontroller);
  }
};

Adapter.prototype.unregisterObserver = function(viewcontroller) {
  _.without(this.observers, viewcontroller);
};

Dalmatian.Adapter = Adapter;

var Communicator = function(options){
  this.type = options.type || 'GET';
  this.url = options.url;
}

Communicator.prototype.execute = function(onSuccess, onError) {
  $.ajax({
    type: this.type,
    url: this.url,
    success: onSuccess,
    error: onError
  });
};

Dalmatian.Communicator = Communicator;

var ViewController = function(){

}