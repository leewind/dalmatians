var AlertView = _.inherit(Dalmatian.View, {
  initialize: function ($super, options) {

    this.statusSet = {
      'INIT': 'init',
      'PROCESSING': 'processing'
    };

    this.templateSet = {
      'init' : '<button><%=data%></button>',
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
        assert(alertView.html === '<button>hello world</button>');
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
      var alertAdapter = new AlertAdapter({
        datamodel: {data: 'hello'}
      });
      var alertView = new AlertView();
      var controller_origin = new Dalmatian.ViewController({
        view: alertView,
        viewstatus: alertView.statusSet['INIT'],
        onViewUpdate: function() {
          assert(true)
        }
      });

      alertAdapter.registerObserver(controller_origin);
      alertAdapter.notifyDataChanged();
    })
  })
});

var AlertController = _.inherit(Dalmatian.ViewController, {});

suite('Dalmatian.ViewController', function() {
  suite('#handleOptions(options)', function() {
    test('should transfer options to object properties', function() {
      var alertAdapter = new AlertAdapter({
        datamodel: {data: 'hello'}
      });
      var alertView = new AlertView();

      var name = 'tdd-test'
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        name: name
      });

      assert(alertController.name === name);
    });
  });

  suite('#initialize(options)', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });

    var alertView = new AlertView();

    var name = 'tdd-test';
    var alertController = new AlertController({
      view: alertView,
      adapter: alertAdapter,
      viewstatus: alertView.statusSet['INIT'],
      name: name
    });

    test('should initialize controllerid', function() {
      assert(alertController.controllerid !== 'undefined')
    });

    test('should create view.root and view.html', function() {
      assert(alertController.view.html === '<button>hello</button>')
    });
  });

  suite('#create()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('should execute onViewBeforeCreate before create and execute onViewAfterCreate after create', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        onViewBeforeCreate: function() {
          this.beforedata = 1
          assert(typeof this.afterdata === 'undefined');
        },
        onViewAfterCreate: function() {
          this.afterdata = 2;
          assert(this.afterdata > this.beforedata);
        }
      });
    });

    test('should render view', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
      });
      assert(alertController.view.html === '<button>hello</button>')
    })
  });

  // @description test for api:show()
  suite('#show()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('should execute onViewBeforeShow before show and execute onViewAfterShow after show', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        onViewBeforeShow: function() {
          this.beforedata = 1
          assert(typeof this.afterdata === 'undefined');
        },
        onViewAfterShow: function() {
          this.afterdata = 2;
          assert(this.afterdata > this.beforedata);
        }
      });
      alertController.show();

      var displaySetting = alertController.$el.css('display');
      assert(displaySetting === 'undefined' || displaySetting === 'block')
    });

    test('should append view onto document', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container'
      });
      alertController.show();
      assert($('#'+alertView.viewid).length > 0);
    })
  });

  suite('#recreate()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('should execute onViewBeforeRecreate before recreate and execute onViewAfterRecreate after recreate', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        onViewBeforeRecreate: function() {
          this.beforedata = 1
          assert(typeof this.afterdata === 'undefined');
        },
        onViewAfterRecreate: function() {
          this.afterdata = 2;
          assert(this.afterdata > this.beforedata);
        },
      })
      alertController.recreate();
    });

    // 当调用recreate时默认会调用onViewUpdate
    test('should execute update method to update or render view', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        onViewUpdate: function() {
          assert(true);
        }
      });
      alertController.recreate();
    });
  });

  suite('#hide()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('should execute onViewBeforeHide before hide and execute onViewAfterHide after hide', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        onViewBeforeHide: function() {
          this.beforedata = 1
          assert(typeof this.afterdata === 'undefined');
        },
        onViewAfterHide: function() {
          this.afterdata = 2;
          assert(this.afterdata > this.beforedata);
        },
      })
      alertController.hide();
    });

    // 当调用recreate时默认会调用onViewUpdate
    test('should execute update method to update or render view', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
      });
      alertController.show();
      alertController.hide();

      var displaySetting = alertController.$el.css('display');
      assert(displaySetting === 'none');
    });
  });

  suite('#bindEvents()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('parse events map and set events to dom', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        events: {
          'click button': 'clickbtn'
        },
        clickbtn: function() {
          assert(true);
        }
      });

      alertController.show();
      $('.container button').trigger('click');
    });
  });

  suite('#unBindEvents()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('forze all events on dom', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        events: {
          'click button': 'clickbtn'
        },
        clickbtn: function() {
          assert(false);
        }
      });

      alertController.show();
      alertController.unBindEvents();
      $('.container button').trigger('click');
    });
  });

  suite('#forze()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('should execute onViewBeforeForzen before hide and execute onViewAfterForzen after hide', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        onViewBeforeForzen: function() {
          this.beforedata = 1
          assert(typeof this.afterdata === 'undefined');
        },
        onViewAfterForzen: function() {
          this.afterdata = 2;
          assert(this.afterdata > this.beforedata);
        },
      });
      alertController.show();
      alertController.forze();
    });

    test('should execute unBindEvents to cancel all events on dom', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        events: {
          'click button': 'clickbtn'
        },
        clickbtn: function() {
          assert(false);
        },
      });

      alertController.show();
      alertController.forze();
      $('.container button').trigger('click');
    });
  });

  suite('#destory()', function() {
    var alertAdapter = new AlertAdapter({
      datamodel: {data: 'hello'}
    });
    var alertView = new AlertView();

    test('should execute onViewBeforeDestory before destory and execute onViewAfterDestory after destory and $el would be remove after destory', function() {
      var alertController = new AlertController({
        view: alertView,
        adapter: alertAdapter,
        viewstatus: alertView.statusSet['INIT'],
        container: '.container',
        onViewBeforeDestory: function() {
          this.beforedata = 1
          assert(typeof this.afterdata === 'undefined');
        },
        onViewAfterDestory: function() {
          this.afterdata = 2;
          assert(this.afterdata > this.beforedata);
        },
      });
      alertController.show();
      alertController.destory();

      assert(alertController.$el.html() === '');
    });
  })

});
