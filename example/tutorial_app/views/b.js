define([], function () {

  var View = function () {
    console.log('view b init');
  };

  View.prototype = {
    show: function () {
      console.log('view b show');
    },
    hide: function () {
      console.log('view b hide');
    }

  };

  return View;

});





