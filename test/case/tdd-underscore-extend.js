suite('Underscore.extend', function() {

  suite('#inherit(origin, methods)', function() {

    test('should inherit object function', function() {
      var origin = _.inherit({
        name: 'origin',
        tag: 'origin',
        show: function() {
          return 'this is origin';
        },
        spec: function() {
          return 'this is origin "spec"';
        }
      });

      var extend = _.inherit(origin, {
        name: 'extend',
        show: function() {
          return 'this is extend';
        }
      });

      var expect = _.inherit({
        name: 'extend',
        tag: 'origin',
        show: function() {
          return 'this is extend'
        },
        spec: function() {
          return 'this is origin "spec"';
        }
      });
      var expectInstance =  new expect();
      var realInstance = new extend();

      assert(expectInstance.tag === realInstance.tag, 'tag value should be inherited');
      assert(expectInstance.name === realInstance.name, 'name value should be inherited');
      assert(expectInstance.show() === realInstance.show());
      assert(expectInstance.spec() === realInstance.spec());
    })
  });

  suite("#realize(key, scope)", function() {
    test('should return function by key value', function() {
      var action = function() {
        return 'keyFn'
      }

      var requireFn = _.realize(action, this);
      assert(typeof requireFn === 'function');
      assert(requireFn() === 'keyFn');

      var action = {
        'keyFn': function(){
          return 'keyFn'
        }
      };
      var requireFn = _.realize('keyFn', action);
      assert(typeof requireFn === 'function');
      assert(requireFn() === 'keyFn');

      var requireFn = _.realize();
      assert(typeof requireFn === 'function');
    });
  });

  suite('execute(method, scope, params)', function() {

    test('shoudl call method by using passing scope', function() {
      var Origin = function() {
        this.name = 'this is origin method'
      };
      Origin.prototype.get = function() {
        return this.name;
      };
      var origin = new Origin();

      var Caller = function() {
        this.name = 'this is caller method';
      }
      var caller = new Caller();

      var str = _.execute(origin.get, caller, []);
      assert(str === 'this is caller method');
    });
  });

  suite('pack(fn, beforeFnKey, afterFnKey, context)', function() {

    test('methods should be executed one by one', function() {
      var value = 0;
      var beforeFnKey = function() {
        assert(value === 0);
        value = 1;
      }
      var afterFnKey = function() {
        assert(value === 2);
      }

      _.pack(function() {
        assert(value === 1);
        value = 2;
      }, beforeFnKey, afterFnKey, this);
    });

  });
});
