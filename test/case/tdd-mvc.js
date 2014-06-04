var AlertView = _.inherit(Dalmatian.View, {
  initialize: function ($super, options) {

    this.statusSet = {
      'INIT': 'init',
      'PROCESSING': 'processing'
    };

    this.templateSet = {
      'init' : '<%=data%>',
      'processing': '<%=name%>',
    };

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

  // @description test for api:initialize()
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

  // @description test for api:render(status, data, callback)
  suite('#render(status, data, callback)', function() {
    var alertView = new AlertView();
    test('render view according to status and data', function() {
      var text = 'hello world';

      alertView.render(alertView.statusSet['INIT'], {data: text}, function() {
        assert(alertView.html === text);
      });
    });
  });

  // @description test for api:update(status, data)
  suite('#update(status, data)', function() {
    var alertView = new AlertView();

    test('update view according to status and data changed', function() {
      var text = 'hello world';
      var updateText = 'update hello world';

      alertView.render(alertView.statusSet['INIT'], {data: text}, function() {});
      alertView.update(alertView.statusSet['PROCESSING'], {name: updateText});

      assert(alertView.html === updateText);
    });
  });


});
