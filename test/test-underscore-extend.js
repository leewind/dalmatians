var assert = require("assert");
var _ = require("../src/underscore-extend");

describe("underscore.extend", function() {

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

  describe("#inherit()", function() {
    it('should inherit object function', function() {
      var expectInstance =  new expect();
      var realInstance = new extend();

      assert.equal(expectInstance.tag, realInstance.tag);
      assert.equal(expectInstance.name, realInstance.name);
      assert.equal(expectInstance.show(), realInstance.show());
      assert.equal(expectInstance.spec(), realInstance.spec());
    });
  });

})