"use strict";


var Application = _.inherit({

  //设置默认的属性
  defaultPropery: function () {

    //存储view队列的hash对象，这里会新建一个hash数据结构，暂时不予理睬
    this.views = {};

    //当前view
    this.curView;



  },

  handleOptions: function (opts) {
    _.extend(this, opts);
  },

  initializ: function (opts) {

    this.defaultPropery();
    this.handleOptions(opts);




  }




});




















