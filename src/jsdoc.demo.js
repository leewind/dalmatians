/**
* @fileOverview 简单的类对象标注示例
* @author <a href=”llying.javaeye.com”>llying</a>
* @version 0.1
*/

/**
* @author llying
* @constructor Person
* @description 一个Person类
* @see The <a href=”#”>llying</a >.
* @example new Parent(“张三”,15);
* @since version 0.1
* @param {String} username 姓名
* @param {Num} age 年龄
*/
function Person(username,age)
{
    /**
    * @description {Sting} 姓名
    * @field
    */
    this.username = username;
    
    /**
    * @description {Num} 年龄
    * @field
    */
    this.age = age;
    
    /**
    * @description 弹出say内容
    * @param {String} content 内容
    */
    this.say = function(content)
    {
        alert(this.username+” say :”+content);
    }
    
    /**
    * @description 返回json格式的对象
    * @return {String} json格式
    * @see Person#say
    */
    this.getJson = function(){
        return “{name:”+this.username+”,age”+this.age+”}”;
    }
}