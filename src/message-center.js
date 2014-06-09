"use strict";

var Dalmatian = Dalmatian || {};

var Message = Dalmatian.Message = _.inherit({
  initialize: function(options) {
    this.data = options.data;
    this.id = _.uniqueId('message-');
  },

  get: function() {
    return {
      id: this.id,
      data: this.data
    };
  }
});

Dalmatian.MessageBox = _.inherit({

  initialize: function(options) {
    this.handleOptions(options);
  },

  _verify: function(options) {
    // if (!_.property('center')(options)) throw Error('MessageBox必須知道MessageCenter');

    if (!_.property('namespace')(options)) throw Error('MessageBox必須有自己的namspace');
  },

  handleOptions: function(options) {
    this._verify(options);

    this.namespace = options.namespace;
    this.center = options.center;

    this.archive = [];

    if (_.isFunction(options.onReceived)) {
      this.onReceived = options.onReceived;
    }

    this.id = _.uniqueId('message-box-');
  },

  create: function(data) {
    var message = new Message({ data: data });
    this.archive.push(message);

    return message;
  },

  send: function(namespace, messageboxid, message) {
    this.center.dispatch(namespace, messageboxid, message);
  },

  remove: function(message) {
    _.without(this.archive, message);
  },

  clear: function() {
    this.archive = [];
  }
});

Dalmatian.MessageGroup = _.inherit({
  initialize: function(options) {
    this.handleOptions(options);
  },

  handleOptions: function(options) {
    this.namespace = options.namespace;
    this.members = [];
  }
});

Dalmatian.MessageCenter = _.inherit({
  initialize: function() {
    this.groups = [];
  },

  dispatch: function(namespace, messageboxid, message) {
    if (namespace) {
      var targetspace = _.filter(this.groups, function(group) {
        return group.namespace === namespace;
      });

      var targets = targetspace[0];

      if (messageboxid) {
        targets.members = _.filter(targets.members, function(member) {
          return member.id === messageboxid;
        });
      }

      _.each(targets.members, function(member) {
        if (_.isFunction(member.onReceived)) {
          member.onReceived(message);
        }
      });
    }
  },

  register: function(messagebox) {
    var scope = this;
    var existgroup = _.filter(this.groups, function(group) {
      return group.namespace === messagebox.namespace;
    });

    if (!existgroup || existgroup.length === 0) {
      var messagegroup = new Dalmatian.MessageGroup({
        namespace: messagebox.namespace
      });

      messagebox.center = scope;
      messagegroup.members.push(messagebox);

      this.groups.push(messagegroup);
    } else {

      _.each(existgroup, function(group) {
        var existmember = _.filter(group.members, function(member) {
          return member.id === messagebox.id;
        });

        if (!existmember || existmember.length === 0) {
          messagebox.center = scope;
          group.members.push(messagebox);
        }
      });
    }
  },

  unregister: function(messagebox) {
    _.each(this.groups, function(group) {
      var exist = _.filter(group.members, function(member) {
        return member.id === messagebox.id;
      });

      if (exist && exist.length > 0) {
        _.each(exist, function(box) {
          group.members = _.without(group.members, box);
        });
      }
    });

    this.groups = _.filter(this.groups, function(group) {
      return group.members > 0;
    });
  }
});

Dalmatian.MessageCenter.getInstance = function() {
  if (!this.instance) {
    this.instance = new Dalmatian.MessageCenter();
  }

  return this.instance;
};