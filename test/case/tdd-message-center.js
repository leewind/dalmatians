suite('Dalmatians.Message', function() {

  var test_name = 'michael';
  var message = new Dalmatian.Message({data: {name: test_name}});

  suite('#initialize(options)', function() {
    test('initialize would be executed on initialization', function() {
      assert(message.data.name = test_name);
    });
  });

  suite('#get()', function() {
    test('get the data and id from message object', function() {
      var data = message.get();
      assert(data.id !== 'undefined');
      assert(data.data.name = test_name);
    });
  });
});

suite('Dalmatian.MessageCenter', function() {
  var messageCenter = Dalmatian.MessageCenter.getInstance();

  suite('#getInstance()', function() {
    test('should initialized by singleton', function() {
      assert(messageCenter instanceof Dalmatian.MessageCenter);
    });
  });

  var messageBox = new Dalmatian.MessageBox({
    namespace: 'test'
  });

  suite('#register()', function() {
    test('add messageBox to messageCenter', function() {
      messageCenter.register(messageBox);
      assert(messageCenter.groups.length === 1);
      assert(messageCenter.groups[0].members.length === 1);
    });

    test('messageCenter should not add messageBox to messageCenter repeatlly', function() {
      messageCenter.register(messageBox);
      assert(messageCenter.groups.length === 1);
      assert(messageCenter.groups[0].members.length === 1);
    });
  });

  suite('#unregister()', function() {
    test('remove messageBox from messageCenter', function() {
      messageCenter.unregister(messageBox);
      assert(messageCenter.groups.length === 0);
    });
  });

  suite('#onReceived(message)', function() {
    test('message should be received on api:onReceived(message)', function() {

      var sendInfo = 'message sent';
      var messageBoxSender = new Dalmatian.MessageBox({
        namespace: 'test',
        onReceived: function(message) {
          assert(message.data.name === sendInfo);
        }
      });
      messageCenter.register(messageBoxSender);
      var messageSent = messageBox.create({name: sendInfo});
      messageBox.send('test', null, messageSent);
    });
  });

  suite('#dispatch(namespace, messageboxid, message)', function() {
    test('dispatch message by namespace', function() {
      var sendInfo = 'message sent';
      var messageBoxReceiver = new Dalmatian.MessageBox({
        namespace: 'test',
        center: messageCenter,
        onReceived: function(message) {
          assert(message.data.name === sendInfo);
        }
      });
      messageCenter.register(messageBoxReceiver);
      var messageSent = messageBox.create({name: sendInfo});
      messageCenter.dispatch('test', null, messageSent);
    });

    test('dispatch message by messageboxid and namespace', function() {
      var sendInfo = 'message sent testing messageboxid';
      var messageBoxReceiver = new Dalmatian.MessageBox({
        namespace: 'test',
        onReceived: function(message) {
          assert(message.data.name === sendInfo);
        }
      });
      var messageBoxSilentReceiver = new Dalmatian.MessageBox({
        namespace: 'test',
        onReceived: function(message) {
          assert(message.data.name === sendInfo);
        }
      });
      messageCenter.register(messageBoxReceiver);
      var messageSent = messageBox.create({name: sendInfo});
      messageCenter.dispatch('test', messageBoxReceiver.id, messageSent);
    });
  })
});

suite('Dalmatian.MessageBox', function() {
  var messageBox = new Dalmatian.MessageBox({
    namespace: 'test'
  });

  suite('#create()', function() {
    test('create message with passing data and return message object', function() {
      var info = 'this is message box testing.'
      var message = messageBox.create(info);
      assert(message.data === info)
      assert(messageBox.archive.length === 1);
      assert(messageBox.archive[0].data === info);
    });
  });

  suite('#remove(message)', function() {
    test('remove the message in archive', function() {
      var info = 'this is message box testing.'
      var message = messageBox.create(info);
      messageBox.remove(message);
      assert(messageBox.archive.length === 0);
    });
  });

  suite('#clear()', function() {
    test('remove all messages in archive', function() {
      var info = 'this is message box testing.'
      messageBox.create(info);
      messageBox.create(info);
      assert(messageBox.archive.length === 2)
      messageBox.clear();
      assert(messageBox.archive.length === 0);
    });
  });

  suite('#create()', function() {
    test('create message with passing data and return message object', function() {
      var info = 'this is message box testing.'
      var messageCenter = Dalmatian.MessageCenter.getInstance();
      messageCenter.register(messageBox);

      var messageBoxReceiver = new Dalmatian.MessageBox({
        namespace: 'test',
        onReceived: function(message) {
          assert(message.data === info);
        }
      });
      messageCenter.register(messageBoxReceiver);

      var message = messageBox.create(info);
      messageBox.send('test', messageBoxReceiver.id, message);
    });
  });
})