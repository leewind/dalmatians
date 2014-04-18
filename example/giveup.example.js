var originData = [
  {name: '上海', number: 1},
  {name: '北京', number: 2},
  {name: '南京', number: 3}
];

var DataAdapter = function() {
  Dalmatian.Adapter.call(this);
}

DataAdapter.prototype = new Dalmatian.Adapter();

DataAdapter.prototype.parse = function(data) {
  return {list: data};
};

var dataAdapter = new DataAdapter();
console.log(dataAdapter.parse(originData));

var DEFAULT_TEMPLATE = '<ul><%_.each(list, function(item){%><li><%=item.name%></li><%})%></ul>';

var ListView = function(){
  Dalmatian.View.call(this);
}

ListView.prototype = new Dalmatian.View();

ListView.prototype.onCreate = function() {
  this.html = this.render(DEFAULT_TEMPLATE, dataAdapter.parse(originData));
};

ListView.prototype.onShow = function() {
  $('body').html(this.html);
};

ListView.prototype.onLoad = function() {
  this.html.find('li').on('click', function(){
    console.log(1)
  })
};

