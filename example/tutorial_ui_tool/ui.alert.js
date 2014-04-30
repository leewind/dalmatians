var htmltemplate = $('#template-alert').html();

var AlertView = _.inherit(Dalmatian.View, {
  templateSet: {
    0: htmltemplate,
  },

  statusSet: {
    STATUS_INIT: 0
  }
});

var view = new AlertView()

var Adapter = _.inherit(Dalmatian.Adapter, {
      parse: function(data) {
        return data;
      }
    });

    var adapter = new Adapter();

var Controller = _.inherit(Dalmatian.ViewController, {
  render: function() {
    var data = this.adapter.viewmodel;
    this.view.render(this.viewstatus, data);
  },

  set: function(options) {
    this.adapter.datamodel.content = options.content;
    this.adapter.notifyDataChanged();
  },

  events: {
    "click .cui-btns-cancel": "cancelaction"
  },

  cancelaction: function() {
    this.onCancelBtnClick();
  },

  attr: function(key, value){
    this[key] = value;
  }
});

var controller = new Controller({
  view: view,
  adapter: adapter,
  container: '.container',
  onViewBeforeCreate: function() {

  var origindata = {
      content: 'fuck',
      confirm: 'confirmbtn',
      cancel: 'cancelbtn'
    }

    this.adapter.format(origindata);

    this.adapter.registerObserver(this);
    this.viewstatus = this.view.statusSet.STATUS_INIT;
  },
  onCancelBtnClick: function() {
    alert('cancel 2')
  }
});

controller.show();

$('#addbtn').on('click', function(e) {
  var content = $('#addmsg').val();
  // adapter.datamodel.content = content;
  // adapter.notifyDataChanged();
  controller.set({content: content})
  controller.attr('onCancelBtnClick', function(){
    alert('asdfsafda')
  })
})