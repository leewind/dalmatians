suite('Underscore.extend', function() {

  suite('#inherit(father, methods)', function() {

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

  suite("getNeedFn", function() {
    test('should return function by key value', function() {
      var action = function() {
        return 'keyFn'
      }

      var requireFn = _.getNeedFn(action, this);
      assert(typeof requireFn === 'function');
      assert(requireFn() === 'keyFn');

      var action = {
        'keyFn': function(){
          return 'keyFn'
        }
      };
      var requireFn = _.getNeedFn('keyFn', action);
      assert(typeof requireFn === 'function');
      assert(requireFn() === 'keyFn');

      var requireFn = _.getNeedFn();
      assert(typeof requireFn === 'function');
    });
  });

});
