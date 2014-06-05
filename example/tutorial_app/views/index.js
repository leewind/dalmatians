define([], function () {

  var View = function () {
    console.log('view index init');
  };

  View.prototype = {
    show: function () {
      console.log('view index show');
    },
    hide: function () {
      console.log('view index hide');
    }

  };

  return View;

});





