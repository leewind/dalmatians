var htmltemplate = $('#template-alert').html();

var AlertView = _.inherit(Dalmatian.View, {
  initialize: function ($super, options) {
    this.statusSet = {
      'INIT': 'init'
    };
    this.templateSet = { 'init' : htmltemplate };

    $super(options);
  }
});

var alertView = new AlertView()

var AlertAdapter = _.inherit(Dalmatian.Adapter, {
  initialize: function ($super, options) {

    this.datamodel = {
      content: '请输入文本',
      confirm: '确定',
      cancel: '取消'
    };

    $super(options);
  },
  setContent: function (content) {
    this.datamodel.content = content;
    this.notifyDataChanged();
  }
});

var alertAdapter = new AlertAdapter();

var AlertController = _.inherit(Dalmatian.ViewController, {
  //设置默认信息
  initialize: function ($super, options) {

    this.view = new AlertView();
    this.adapter = new AlertAdapter();
    this.container = '.container';

    $super(options);
  },

  render: function () {
    this.view.render(this.viewstatus, this.adapter && this.adapter.getViewModel());
    this.view.root.html(this.view.html);
  },

  setContent: function (str) {
    this.adapter.setContent(str);
  },

  setAction: function (sureAction, cancelAction) {
    this.sureaction = sureAction;
    this.cancelaction = cancelAction;
  },

  events: {
    "click .cui-btns-cancel": "onCancelAction",
    'click .cui-btns-sure': 'onSureAction'
  },

  onCancelAction: function (e) {
    this.cancelaction && this.cancelaction.call(this, e);
  },

  onSureAction: function (e) {
    this.sureaction && this.sureaction.call(this, e);
  }

});

var alertController = new AlertController();
alertController.show();


describe('MVC initialization:', function() {

  describe('AlertView inherit from Dalmatian.View', function(){
    it('view should inherit from Dalmatian.View', function(){
      assert(alertView instanceof Dalmatian.View);
    });

    it('view should has templateSet with detailed template', function(){
      assert(typeof alertView.templateSet === 'object');
      assert(alertView.templateSet.init === htmltemplate);
    });

    it('view should has statusSet', function(){
      assert(typeof alertView.statusSet === 'object');
    });

    it('view should inherit render method from Dalmatian.View', function(){
      assert(typeof alertView.render === 'function');
      assert(alertView.root.length === 1);
    });
  });

  describe('AlertAdapter inherit from Dalmatian.Adapter', function(){
    it('adapter should inherit from Dalmatian.Adapter', function(){
      assert(alertAdapter instanceof Dalmatian.Adapter);
    });

    it('adapter has initialized datamodel', function(){
      assert(typeof alertAdapter.datamodel === 'object');
    })
  });

  describe('AlertController inherit from Dalmatian.ViewController', function(){

    it('controller should inherit from Dalmatian.ViewController', function(){
      assert(alertController instanceof Dalmatian.ViewController);
    });

    it('controller set view to container', function(){
      assert($('.container section').html() === alertController.$el.html())
    });

    it('controller is able to change the content of view', function(){

      var content = 'this is changed information';
      alertController.setContent(content);

      assert($('.cui-error-tips').text() === content);
    })

  });
})