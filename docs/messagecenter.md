Dalmatians.MessageCenter
--------------------

![Framework UML](https://raw.githubusercontent.com/leewind/dalmatians/develop/docs/images/messagecenter.png)

MessageBox
职责：负责传递和接收Message

+ 用户获得MessageBox的实例之后，需要显示的调用create()，create方法会在内部执行register方法，使用单例的MessageCenter去注册MessageBox。MessageBox在注册时，会用namespace去寻找或者创建MessageGroup，然后把MessageBox的实例加入到MessageGroup的boxes队列里.

+ 用户需要传输之前，需要调用wirte方法，将data封装成Message对象.

+ 调用send方法传递message，send有三个参数，如果只传namespace，那么将data传递给同名namespace下所有messagebox；如果只传messageboxid会将数据传递给当前MessageBox实例所在的MessageGroup，对应messageboxid找到要传递的对象；如果都传入，找到namespace对应的MessageGroup下对应messageboxid的MessageBox实例.


MessageCenter
职责：负责创建消息组，分发消息

+ MessageCenter是单例模式

+ MessageCenter会根据namespace创建MessageGroup，并且将MessageBox的实例加入到MessageGroup的boxes队列中


