var htmltemplate = $('#template-todolist').html();

var view = new Dalmatian.View({
  templateSet: {
    0:htmltemplate
  },
  statusSet: {
    STATUS_INIT: 0
  }
});

var origindata = {
  list: []
};

var Adapter = _.inherit(Dalmatian.Adapter, {
  parse: function (origindata) {
    return origindata;
  }
});

var adapter = new Adapter();

var Controller = _.inherit(Dalmatian.ViewController, {
  events: {
    'change #todoinput': 'showLog',
    'click #todoinput': 'showInput'
  },

  showLog: function(e) {
    var msg = $(e.currentTarget).val();
    console.log(msg);
  },

  showInput: function(e) {
    console.log('show input');
  }
})

var controller = new Controller({
  view: view,
  adapter: adapter,
  container: '.container',
  onViewBeforeCreate: function () {
    this.origindata = origindata;
    this.viewstatus = this.view.statusSet.STATUS_INIT
  }
});

controller.show();

