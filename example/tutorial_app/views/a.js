define([], function () {

  var View = function () {
    console.log('view a init');
  };

  View.prototype = {
    show: function () {
      console.log('view a show');
    },
    hide: function () {
      console.log('view a hide');
    }

  };

  return View;

});





