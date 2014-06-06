var messagecenter = Dalmatian.MessageCenter.getInstance();


var htmltemplate = $('#template-listview').html();

var ListView = _.inherit(Dalmatian.View, {
  initialize: function ($super, options) {

    this.templateSet = { 'init': htmltemplate };

    $super(options);
  }
});

var ListAdapter = _.inherit(Dalmatian.Adapter, {
  format: function() {

    this.viewmodel = { hotposts: []};

    var scope = this;
    if (this.datamodel && this.datamodel.feed) {
      _.each(this.datamodel.feed.entry, function(item) {
        // console.log(item)
        scope.viewmodel.hotposts.push(item)
      });
    };

    console.log(this.viewmodel)

    return this.viewmodel;
  }
});

var ListController = _.inherit(Dalmatian.ViewController, {
  //设置默认信息
  initialize: function ($super, options) {
    this.view = new ListView();
    this.adapter = new ListAdapter();
    this.container = '.hotlist';

    this.messagebox = new Dalmatian.MessageBox({
      center: messagecenter,
      namespace: 'cnblog-hotposts'
    });

    messagecenter.register(this.messagebox);

    $super(options);
  },

  render: function () {
    this.view.render(this.viewstatus, this.adapter.getViewModel());
    this.view.root.html(this.view.html);
  },

  onViewAfterShow: function() {

    var scope = this;
    $.ajax({
      type: 'get',
      url: 'http://dalcnblog.sinaapp.com/api/48HoursTopViewPosts/10',
      success: function(data) {
        scope.adapter.datamodel = data;
        scope.adapter.notifyDataChanged();
      },
      error: function(error) {
        console.error(error)
      }
    })
  },

  events: {
    'click .hotlist li': 'readPost'
  },

  readPost: function(event) {
    console.log($(event.currentTarget).attr('data-id'));


    var postid = $(event.currentTarget).attr('data-id');

    // var scope = this;
    // if (postid && !this.lock) {
    //   this.lock = true;
    //   $.ajax({
    //     url: 'http://dalcnblog.sinaapp.com/api/blog/'+postid,
    //     success: function(data) {
    //       console.log(data);
    //       $('.content').html(data.string);

    //       scope.lock = false;
    //     },
    //     error: function(error) {
    //       scope.lock = false;
    //     }
    //   })
    // };

    var message = this.messagebox.create({postid: postid});
    this.messagebox.send('cnblog-hotposts', null, message);
  }
});

var controller = new ListController();
controller.show();


var ContentView = _.inherit(Dalmatian.View, {
  initialize: function($super, options) {
    this.templateSet = {'init': '<%=content %>'}

    $super(options);
  }
});

var ContentAdapter = _.inherit(Dalmatian.Adapter, {
  format: function() {

    this.viewmodel = {content: ''};

    if (this.datamodel && this.datamodel.string) {
      this.viewmodel.content = this.datamodel.string
    }

    return this.viewmodel;
  }
});

var ContentController = _.inherit(Dalmatian.ViewController, {
  initialize: function ($super, options) {
    this.view = new ContentView();
    this.adapter = new ContentAdapter();
    this.container = '.content';

    var scope = this;
    this.messagebox = new Dalmatian.MessageBox({
      center: messagecenter,
      namespace: 'cnblog-hotposts',
      onReceived: function(message) {

        console.log(message)

        if (message && message.data && message.data.postid) {
          scope.readPost(message.data.postid);
        }
      }
    });

    messagecenter.register(this.messagebox);

    $super(options);
  },

  render: function () {
    this.view.render(this.viewstatus, this.adapter && this.adapter.getViewModel());
    this.view.root.html(this.view.html);
  },

  readPost: function(postid) {
    var scope = this;
    if (postid && !this.lock) {
      this.lock = true;

      $.ajax({
        url: 'http://dalcnblog.sinaapp.com/api/blog/'+postid,
        success: function(data) {
          console.log(data);
          $('.content').html(data.string);

          scope.lock = false;
        },
        error: function(error) {
          scope.lock = false;
        }
      })
    };
  }
});

var contenController = new ContentController();
contenController.show();