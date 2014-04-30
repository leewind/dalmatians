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
adapter.format(origindata);

var Controller = _.inherit(Dalmatian.ViewController, {

  render: function() {
    console.log('controller-render')
    var data = adapter.viewmodel;
    this.view.render(this.viewstatus, data);
  },

  events: {
    'click button': 'action'
  },

  action: function(e) {
    e.preventDefault();

    var target = $(e.currentTarget).attr('data-action');
    var strategy = {
      'add': function(e) {
        var value = $('#todoinput').val();
        adapter.datamodel.list.push({content: value});
        // this.adapter.parse(this.adapter.datamodel);
        adapter.notifyDataChanged();
      }
    }

    strategy[target].apply(this, [e]);
  }
})

var controller = new Controller({
  view: view,
  container: '.container',
  onViewBeforeCreate: function () {
    this.viewstatus = this.view.statusSet.STATUS_INIT
  }
});

adapter.registerObserver(controller);

controller.show();

