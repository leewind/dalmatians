Dalmatian = Dalmatian || {};

Dalmatian.AbstractCommunicator = AbstractCommunicator = _.inherit({
  initialize: function(options) {},

  // @abstract method
  create: function() {},

  // @abstract method
  update: function() {},

  // @abstract method
  read: function() {},

  // @abstract method
  remove: function() {}
});

var DEFAULT_TIMEOUT = 2000;
var DEFAULT_CONTENT_TYPE = 'application/json';
var DEFAULT_DATA_TYPE = 'json';

Dalmatian.AjaxCommunicator = _.inherit(Dalmatian.AbstractCommunicator, {

  initialize: function(options) {
    this.url = options.url;
    this.contentType = options.contentType || DEFAULT_CONTENT_TYPE;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.context = options.context || this;
    this.dataType = options.dataType || DEFAULT_DATA_TYPE;
  },

  _select: function(key, options) {
    if (_.isObject(options)) return options[key] || this[key];
    else return this[key];
  },

  _setOptions: function(optiions) {
    var emptyfn = function() {};
    return {
      type: options.type,
      data: options.param,
      url: this._select('url', options),
      contentType: this._select('contentType', options),
      timeout: this._select('timeout', options),
      context: this._select('context', options),
      dataType: this._select('dataType', options),
      success: options.success || emptyfn,
      error: options.error || emptyfn,
      beforeSend: options.beforeSend || emptyfn,
      complete: options.complete || emptyfn
    }
  },

  create: function(options) {
    options = options || {}
    options.type = 'POST';
    $.ajax(this._setOptions(options));
  },

  update: function(options) {
    options = options || {}
    options.type = 'PUT';
    $.ajax(this._setOptions(options));
  },

  read: function(options) {
    options = options || {}
    options.type = 'GET';
    $.ajax(this._setOptions(options));
  },

  remove: function(options) {
    options = options || {}
    options.type = 'DELETE';
    $.ajax(this._setOptions(options));
  }

});

Dalmatian.LocalStorageCommunicator = _.inherit(Dalmatian.AbstractCommunicator, {

  initialize: function() {
    if (!window.localStorage) throw Error('not support localstorage');
  },

  create: function(options) {
    if (_.isObject(options) && _.property('key')(options) && !window.localStorage[options.key]) {
      return window.localStorage.setItem(options.key, options.value);
    }

    return false;
  },

  update: function(options) {
    if (_.isObject(options) && window.localStorage[options.key]) {

      // @notation 如果用户只想set某个属性可以再这里修改
      var newData = window.localStorage[options.key];
      if (_.isFunction(options.onFound))
        newData = options.onFound.call(this, newData);

      return window.localStorage.setItem(options.key, options.value);
    }

    return false;
  },

  read: function(options) {
    if (_.isObject(options)) {
      return window.localStorage[options.key];
    }

    return null;
  },

  remove: function(options) {
    if (_.isObject(options) && window.localStorage[options.key]) {
      return window.localStorage.removeItem(options.key);
    }

    return false;
  },

  clear: function() {
    window.localStorage.clear();
  }

});