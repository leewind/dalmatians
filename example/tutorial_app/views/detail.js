define(['text!templates/detail.html', 'text!templates/detail_article.html'], function (html, article) {
  var View = _.inherit(Dalmatian.View, {
    _initialize: function ($super) {
      $super();

      this.templateSet = {
        init: html,
        loading: '<div>正在加载请稍后...</div>',
        ajaxSuc: article
      };
    }
  });

  var Adapter = _.inherit(Dalmatian.Adapter, {
    _initialize: function ($super) {
      $super();
      this.datamodel = {};
    },

    format: function (datamodel) {
      return datamodel && datamodel.value;
    },

    setData: function (data) {
      this.datamodel.value = data;
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
        ajaxSuc: '.cont_wrap'
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
      var id = _.getUrlParam().id;
      var scope = this;
      if (id) {
        $.ajax({
          url: 'http://dalcnblog.sinaapp.com/api/blog/' + id,
          success: function (data) {
            scope.viewstatus = 'ajaxSuc';
            scope.adapter.setData(data);
          }
        })
      }

    },


    events: {
      'click #js_return': function (e) {
        app.back();
      }
    }
  });



  return ViewController;

});





