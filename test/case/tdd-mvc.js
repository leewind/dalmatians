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

var AlertAdapter = _.inherit(Dalmatian.Adapter, {});

suite('Dalmatian.Adapter', function() {

  suite('#handleOptions(options)', function() {
    var time = Date.now();
    var alertAdapter = new AlertAdapter({
      datamodel: {time: time}
    });

    test('should transfer options to object properties', function() {
      assert(alertAdapter.datamodel.time === time);
    })
  });

  suite('#initialize()', function() {
    var alertAdapter = new AlertAdapter();
    test('call _initialize method to initialize observers', function() {
      assert(alertAdapter.observers instanceof Array);
      assert(alertAdapter.datamodel instanceof Object);
    });
  });

  suite('#format(data)', function() {
    var alertAdapter = new AlertAdapter();
    var time = Date.now();
    var viewmodel = alertAdapter.format({time: time});

    test('format data and filter necessary data to viewmodel', function() {
      assert(viewmodel === alertAdapter.viewmodel)
    });
  });

  suite('#getViewModel()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {time: Date.now()}
    });
    var viewmodel = alertAdapter.getViewModel();

    test('getViewModel should call format method and return viewmodel', function() {
      assert(alertAdapter.viewmodel === viewmodel);
      assert(alertAdapter.viewmodel === alertAdapter.datamodel);
    });
  });

  suite('#registerObserver(viewcontroller)', function() {
    var alertAdapter = new AlertAdapter();
    var controller = new Dalmatian.ViewController();

    test('add observer into alertAdapter observer array', function() {
      alertAdapter.registerObserver(controller);

      assert(alertAdapter.observers.length === 1);
    });

    test('should not add the same observer', function() {
      alertAdapter.registerObserver(controller);

      assert(alertAdapter.observers.length === 1);
    });
  });

  suite('#unregisterObserver(viewcontroller)', function() {
    var alertAdapter = new AlertAdapter();

    var controller_origin = new Dalmatian.ViewController();
    var controller_new = new Dalmatian.ViewController();

    alertAdapter.registerObserver(controller_origin);
    alertAdapter.registerObserver(controller_new);

    test('should remove the same observer from observers', function() {
      alertAdapter.unregisterObserver(controller_new);
      assert(alertAdapter.observers.length === 1);
    });
  });

  suite('#notifyDataChanged()', function() {
    test('when data changed controller should notify', function() {
      var alertAdapter = new AlertAdapter();
      var controller_origin = new Dalmatian.ViewController({
        onViewUpdate: function() {
          assert(true)
        }
      });

      alertAdapter.registerObserver(controller_origin);
      alertAdapter.notifyDataChanged();
    })
  })
})
