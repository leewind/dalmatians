Dalmatian = Dalmatian || {};

Dalmatian.MessageBox = _.inherit({

  // @description

  initialize: function(options) {
    this.handleOptions(options);
  },

  handleOptions: function(options){
    this.namespace = options.namespace;
    this.id = _.unique('message-box-');
  },

  create: function(){

   },

   send: function(namespace, messageboxid, message){

   },

   send: function(namespace, message){

   },

   write: function(data){

   },

   destory: function(){

   },

   onReceived: function(){
    throw new Error('onReceived方法必须被复写');
   }

});

Dalmatian.MessageGroup = _.inherit({
  initialize: function(options){
    this.handleOptions(options);
  },

  handleOptions: function(options){
    this.namespace = options.namespace;
    this.members = [];
  }
})


Dalmatian.MessageCenter = _.inherit({
  initialize: function(){
    this.groups = [];
  },

  dispatch: function(namespace, messageboxid, message){
    if (namespace) {
      var targetspace = _.filter(this.groups, function(group){
        return group.namespace === namespace;
      });

      var targets = targetspace;

      if (messageboxid) {
        targets = _.filter(targetspace.member, function(member){
          return member.id === messageboxid;
        });
      }

      _.each(targets.members, function(member){
        member.onReceived(message);
      });
    };

  },

  register: function(messagebox){
    var existgroup = _.filter(this.groups, function(group){
      return group.namespace = messagebox.namespace;
    });

    if (!existgroup || existgroup.length === 0 ) {
      var messagegroup = new MessageGroup({
        namespace: messagebox.namespace,
      });

      messagegroup.members.push(messagebox);

      this.groups.push(messagegroup);
    }else{

      _.each(existgroup, function(group){
        var existmember = _.filter(group.members, function(member){
          return member.id === messagebox.id
        });

        if (!existmember || existmember.length === 0) {
          group.members.push(messagebox);
        };
      });
    }
  },

  unregister: function(messagebox){
    _.each(ths.groups, function(group){
      var exist = _.filter(group.members, function(member){
        return member.id === messagebox.id;
      });

      if (exist && exist.length > 0) {
        _.each(exist, function(box){
          group.members = _.without(group.members, box);
        });
      };
    })
  }
})
