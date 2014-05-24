# mvc

### UML图

![Toast UML](https://raw.githubusercontent.com/leewind/dalmatians/master/doc/images/mvc.png)

### 简单描述
框架View MVC模型，用于组件以及业务View继承，这里包含三个模块Adapter/View/ViewController



### adapter Attribute

    // @param observers {array}               存放观察者，观察者类型为ViewController
    // @param datamodel {object}              数据模型，用以生成viewModel的原始数据


**public initialize**

  // 构造函数
  // @param options {Object}     实例化时传入的参数
  initialize: function (options) {}

**public _initialize**

  // 设置默认属性
  _initialize: function () {}

**public handleOptions**

  // 根据传入参数处理实例属性
  // @param options {Object}     实例化时传入的参数
  handleOptions: function (options) {}

**public format**

  // 解析原始数据模型，返回生成的viewModel用于渲染数据
  // @param datamodel {Object}     原始数据模型
  // $return Object
  format: function (datamodel) {}

**public getViewModel**

  // 调用format，返回生成的viewModel用于渲染数据
  // $return Object
  getViewModel: function (datamodel) {}

**public registerObserver**

  // 注册数据模型的观察者
  // @param viewcontroller {Viewcontroller}     监控对象
  registerObserver: function (viewcontroller) {}

**public unregisterObserver**

  // 注销数据模型的观察者
  // @param viewcontroller {Viewcontroller}     监控对象
  unregisterObserver: function (viewcontroller) {}


**public notifyDataChanged**

  // 触发datamodel改变事件，分发消息至viewcontroller
  // @param viewcontroller {Viewcontroller}     监控对象
  notifyDataChanged: function () {}

