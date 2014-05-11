var htmltemplate = $('#template-alert').html();

var AlertView = _.inherit(Dalmatian.View, {
  templateSet: {
    0: htmltemplate
  },
  
  statusSet: {
    STATUS_INIT: 0
  }
});


var Adapter = _.inherit(Dalmatian.Adapter, {
  parse: function (data) {
    return data;
  }
});

var Controller = _.inherit(Dalmatian.ViewController, {
  //设置默认信息
  _initialize: function () {
    this.origindata = {
      content: '',
      confirm: '确定',
      cancel: '取消'
    }
  },

  initialize: function ($super, opts) {
    this._initialize();
    $super(opts);
    this._init();
  },

  //基础数据处理
  _init: function () {
    this.adapter.format(this.origindata);
    this.adapter.registerObserver(this);
    this.viewstatus = this.view.statusSet.STATUS_INIT;
  },

  render: function () {
    var data = this.adapter.viewmodel;
    this.view.render(this.viewstatus, data);
  },

  set: function (options) {
    _.extend(this.adapter.datamodel, options);
//    this.adapter.datamodel.content = options.content;
    this.adapter.notifyDataChanged();
  },

  events: {
    "click .cui-btns-cancel": "cancelaction"
  },

  cancelaction: function () {
    this.onCancelBtnClick();
  }
});

var view = new AlertView()
var adapter = new Adapter();

var controller = new Controller({
  view: view,
  adapter: adapter,
  container: '.container',
  onCancelBtnClick: function () {
    alert('cancel 2')
  }
});

$('#addbtn').on('click', function (e) {
  var content = $('#addmsg').val();
  // adapter.datamodel.content = content;
  // adapter.notifyDataChanged();
  controller.set({ content: content, confirm: '确定1' });
  controller.show();
});