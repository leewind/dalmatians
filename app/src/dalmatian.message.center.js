'use strict';

(function () {
  var Dalmatian = this.Dalmatian = this.Dalmatian || {};

  /**
   * Message数据对象，封装了message的id和具体的data
   */
  var Message = Dalmatian.Message = _.inherit({

    /**
     * 初始化方法，设置需要传入的参数，创建message的唯一id
     * @param  {object} options 用户需要设置的属性
     */
    initialize: function(options) {
      this.data = options.data;
      this.id = _.uniqueId('message-');
    },

    /**
     * 获得message的id和数据
     * @return {object} 返回id和message带有的数据，其结构一定为：{id: _id, data: _data}
     */
    get: function() {
      return {
        id: this.id,
        data: this.data
      };
    }
  });

  Dalmatian.MessageBox = _.inherit({

    /**
     * 验证用户传入的数据是不是有必须的字段
     * @param  {object} options 用户传入需要设置成属性的参数
     */
    _verify: function(options) {
      if (!_.property('namespace')(options)) {
        throw new Error('MessageBox必須有自己的namspace');
      }
    },

    /**
     * 调用handleOptions方法，将用户传入的参数设置成对象属性
     * 创建历史消息队列，创建MessageBox的id
     * @param  {object} options 用户传入需要设置成属性的参数
     */
    initialize: function(options) {
      this.archive = [];
      this.id = _.uniqueId('message-box-');

      this.handleOptions(options);
    },

    /**
     * 将用户传入的参数设置成对象属性，可以设置3个字段namespace/center/onReceived
     * @param  {object} options 用户传入需要设置成属性的参数
     */
    handleOptions: function(options) {
      this._verify(options);

      this.namespace = options.namespace;
      this.center = options.center;

      if (_.isFunction(options.onReceived)) {
        this.onReceived = options.onReceived;
      }
    },

    /**
     * 创建并返回Message，同时把创建的Message存档
     * @param  {object} data  用户需要传递和封装的信息
     * @return {Message}      根据传入的data创建的Message对象
     */
    create: function(data) {
      var message = new Message({ data: data });
      this.archive.push(message);

      return message;
    },

    /**
     * 根据namespace/messageboxid将Message传递到具体的MessageBox
     * @param  {string} namespace    MessageBox的命名空间
     * @param  {string} messageboxid MessageBox的具体id
     * @param  {Message} message     需要传递的Message对象
     */
    send: function(namespace, messageboxid, message) {
      this.center.dispatch(namespace, messageboxid, message);
    },

    /**
     * 删除存档队列中的message对象
     * @param  {Message} message 需要删除的message对象
     */
    remove: function(message) {
      this.archive = _.filter(this.archive, function(archivedMessage) {
        return archivedMessage.id !== message.id;
      });
    },

    /**
     * 清楚存档队列中所有message
     */
    clear: function() {
      this.archive = [];
    }
  });

  Dalmatian.MessageGroup = _.inherit({

    /**
     * 初始化MessageGroup，初始化members队列
     * @param  {object} options 用户传入的需要设置成属性的参数
     */
    initialize: function(options) {
      this.members = [];
      this.handleOptions(options);
    },

    /**
     * 设置用户传入的参数，只允许传入namespace
     * @param  {object} options 用户传入的需要设置成属性的参数
     */
    handleOptions: function(options) {
      this.namespace = options.namespace;
    }
  });

  Dalmatian.MessageCenter = _.inherit({

    /**
     * 初始化groups队列
     */
    initialize: function() {
      this.groups = [];
    },

    /**
     * 根据namespace/messageboxid将Message分发到具体的MessageBox
     * @param  {string} namespace    MessageBox的命名空间
     * @param  {string} messageboxid MessageBox的具体id
     * @param  {Message} message     需要传递的Message对象
     */
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

    /**
     * 将messagebox注册到messagegroup中，根据namespace来建立messagegroup
     * 如果存在messagegroup直接推入，如果不存在messagegroup再推入
     * @param  {MessageBox} messagebox 需要group的messagebox实例
     */
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

    /**
     * 将messagebox从messagegroup中，根据namespace来移除
     * 如果移除后messagegroup没有messagebox实例则删除该messagegroup
     * @param  {MessageBox} messagebox 需要移除group的messagebox实例
     */
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

  // 单例模式，惰性生成MessageCenter实例
  Dalmatian.MessageCenter.getInstance = function() {
    if (!this.instance) {
      this.instance = new Dalmatian.MessageCenter();
    }

    return this.instance;
  };
}).call(window);