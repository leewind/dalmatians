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

suite('Dalmatian.View', function() {

  // @description test for api:handleOptions(options)
  suite('#handleOptions(options)', function() {
    test('should transfer options to object properties', function() {

      var alertname = 'alert-notifier';
      var closeAction = function() {
        return 'close action';
      }
      var alertView = new AlertView({ name: alertname, closeAction: closeAction});

      assert(alertView.name === alertname);
      assert(alertView.closeAction === closeAction);
    });
  });

  suite('#initialize()', function() {
    var alertView = new AlertView();

    test('call _initialize method, set unique viewid for current view and set defaultContainerTemplate', function() {
      assert(typeof alertView.viewid !== 'undefined');
      assert(typeof alertView.defaultContainerTemplate !== 'undefined');
    });

    test('call _initRoot method, set dom to root', function() {
      assert(alertView.root.attr('id'))
    });
  });

  suite('#render(status, data, callback)', function() {

    test('render view according to status and data', function() {

    })
  })


});
