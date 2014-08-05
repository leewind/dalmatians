Dalmatians.Framework
--------------------

![Framework UML](https://raw.githubusercontent.com/leewind/dalmatians/develop/docs/images/framework.png)

有了一些基本的想法，暂时还没有把UI Library这些组件囊括进去，这一层的设计是简单的WebApp运行的框架

暂时分成4个模块

+ 基础的MVC架构，包括了View/Adapter/ViewController
+ 消息模块MessageCenter，负责View与View之间的通信，包括了广播
+ WebApp的Manager层，一个主要的模块，利用不同的ViewManager与Router的组合形成WebApp运行的主题
+ 数据通信模块，这个模块看做是对数据源的读写，可以是本地的数据库，也可以是服务端的接口
