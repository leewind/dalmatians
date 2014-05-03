var htmltemplate = $('#template-todolist').html();

var Adapter = _.inherit(Dalmatian.Adapter, {
  parse: function (origindata) {
    return origindata;
  }
});

var Controller = _.inherit(Dalmatian.ViewController, {

  //设置默认信息
  _initialize: function () {
    this.view = new Dalmatian.View({
      templateSet: {
        0: htmltemplate
      },
      statusSet: {
        STATUS_INIT: 0
      }
    });
    this.adapter = new Adapter();

  },

  initialize: function ($super, opts) {
    this._initialize();
    $super(opts);
  },

  render: function () {
    console.log('controller-render')
    var data = this.adapter.viewmodel;
    this.view.render(this.viewstatus, data);
  },


  container: '.container',
  onViewBeforeCreate: function () {
    this.adapter.format({
      list: []
    });
    this.adapter.registerObserver(this);
    this.viewstatus = this.view.statusSet.STATUS_INIT
  },

  events: {
    'click button': 'action'
  },

  action: function (e) {
    e.preventDefault();

    var target = $(e.currentTarget).attr('data-action');
    var strategy = {
      'add': function (e) {
        var value = $('#todoinput').val();
        this.adapter.datamodel.list.push({ content: value });
        // this.adapter.parse(this.adapter.datamodel);
        this.adapter.notifyDataChanged();
      }
    }

    strategy[target].apply(this, [e]);
  }
})

var controller = new Controller();

controller.show();