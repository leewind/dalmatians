/*
  淳敏，我对你的代码做了调整，不知是否合适，不合适的话就干掉吧
  我感觉message类的实例以及messagegroup存在意义不大，当然我眼光短这件事情大家都知道了，不对的地方你使劲骂

  隐患，同一实例自身事件注册，会被交叉触发，此状态需要处理
*/


Dalmatian = {};

Dalmatian.MessageCenter = _.inherit({
  initialize: function () {
    //框架所有的消息皆存于此
    /* 
    {
    view: {key1: [], key2: []},
    ui: {key1: [], key2: []},
    model: {key1: [], key2: []}
    other: {......}
    }
    */
    this.msgGroup = {};
  },

  _verify: function (options) {
    if (!_.property('namespace')(options)) throw Error('必须知道该消息的命名空间');
    if (!_.property('id')(options)) throw Error('该消息必须具备key值');
    if (!_.property('handler')(options) && _.isFunction(options.handler)) throw Error('该消息必须具备事件句柄');
  },

  //注册时需要提供namespace、key、事件句柄
  //这里可以考虑提供一个message类
  register: function (namespace, id, handler) {
    var message = {};

    if (_.isObject(namespace)) {
      message = namespace;
    } else {
      message.namespace = namespace;
      message.id = id;
      message.handler = handler;

    }

    this._verify(message);

    if (!this.msgGroup[message.namespace]) this.msgGroup[message.namespace] = {};
    if (!this.msgGroup[message.namespace][message.id]) this.msgGroup[message.namespace][message.id] = [];
    this.msgGroup[message.namespace][message.id].push(message.handler);
  },

  //取消时候有所不同
  //0 清理所有
  //1 清理整个命名空间的事件
  //2 清理一个命名空间中的一个
  //3 清理到具体实例上
  unregister: function (namespace, id, handler) {
    var removeArr = [
      'clearMessageGroup',
      'clearNamespace',
      'clearObservers',
      'removeObserver'
      ];
    var removeFn = removeArr[arguments.length];

    if (_.isFunction(removeFn)) removeFn.call(this, arguments);

  },

  clearMessageGroup: function () {
    this.msgGroup = {};
  },

  clearNamespace: function (namespace) {
    if (this.msgGroup[namespace]) this.msgGroup[namespace] = {};
  },

  clearObservers: function (namespace, id) {
    if (!this.msgGroup[namespace]) return;
    if (!this.msgGroup[namespace][id]) return;
    this.msgGroup[namespace][id] = [];
  },

  //没有具体事件句柄便不能被移除
  removeObserver: function (namespace, id, handler) {
    var i, len, _arr;
    if (!this.msgGroup[namespace]) return;
    if (!this.msgGroup[namespace][id]) return;
    _arr = this.msgGroup[namespace][id];

    for (i = 0, len = _arr.length; i < len; i++) {
      if (_arr[i] === handler) _arr[id].splice(i, 1);
    }
  },

  //触发各个事件，事件句柄所处作用域需传入时自己处理
  dispatch: function (namespace, id, data, scope) {
    var i, len, _arr;

    if (!(namespace && id)) return;

    if (!this.msgGroup[namespace]) return;
    if (!this.msgGroup[namespace][id]) return;
    _arr = this.msgGroup[namespace][id];

    for (i = 0, len = _arr.length; i < len; i++) {
      if (_.isFunction(_arr[i])) _arr[i].call(scope || this, data);
    }
  }

});

Dalmatian.MessageCenter.getInstance = function () {
  if (!this.instance) {
    this.instance = new Dalmatian.MessageCenter();
  }
  return this.instance;
};

Dalmatian.MSG = Dalmatian.MESSAGECENTER = Dalmatian.MessageCenter.getInstance();