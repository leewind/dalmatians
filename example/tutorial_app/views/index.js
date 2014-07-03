define(['text!templates/index.html', 'text!templates/index_item.html'], function (html, itemHtml) {

  var View = _.inherit(Dalmatian.View, {
    _initialize: function ($super) {
      $super();

      this.templateSet = {
        init: html,
        loading: '<div>正在加载请稍后...</div>',
        ajaxSuc: itemHtml
      };
    }
  });

  var Adapter = _.inherit(Dalmatian.Adapter, {
    _initialize: function ($super) {
      $super();
      this.datamodel = {};
    },

    format: function (datamodel) {
      return datamodel && datamodel.feed && datamodel.feed.entry;
    },

    setData: function (data) {
      this.datamodel = data;
      this.notifyDataChanged();
    }

  });

  ViewController = _.inherit(Dalmatian.ViewController, {
    _initialize: function ($super) {
      $super();
      //设置基本的属性
      this.view = new View();
      this.adapter = new Adapter();
      this.viewstatus = 'init';
      this.container = '#main-viewport';
    },

    //处理datamodel变化引起的dom改变
    render: function (data) {
      //这里用户明确知道自己有没有viewdata
      var viewdata = this.adapter.getViewModel();

      var wrapperSet = {
        loading: '#lstbox',
        ajaxSuc: '#lstbox'
      };
      //view具有唯一包裹器
      var root = this.view.root;
      var selector = wrapperSet[this.viewstatus];

      if (selector) {
        root = root.find(selector);
      }

      this.view.render(this.viewstatus, this.adapter && this.adapter.getViewModel());

      root.html(this.view.html);

    },

    //显示后Ajax请求数据
    onViewAfterShow: function () {
      this.viewstatus = 'loading';

      var scope = this;
      $.ajax({
        type: 'get',
        url: 'http://dalcnblog.sinaapp.com/api/48HoursTopViewPosts/10',
        success: function (data) {
          scope.viewstatus = 'ajaxSuc';

          scope.adapter.setData(data);
        },
        error: function (error) {
          console.error(error)
        }
      })

    },

    events: {
      'click .orderItem': function (e) {
        var el = $(e.currentTarget);
        var id = el.attr('data-id');

        var even = _.find([1, 2, 3, 4, 5, 6], function (num) { return num % 2 == 0; });

        var data = _.find(this.adapter.getViewModel(), function (obj) {
          return obj.id = id;
        });

        app.forward('detail', {
          param: {
            id: id
          },
          message: data
        });

        var s = '';
      },
      'click .tabcrt': function () {
        app.forward('index');

      }
    }
  });



  return ViewController;

});





