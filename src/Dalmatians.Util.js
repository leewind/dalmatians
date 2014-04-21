
/**
* @description 静态日期操作类，封装系列日期操作方法
* @description 输入时候月份自动减一，输出时候自动加一
* @return {object} 返回操作方法
*/
var dateUtil = {
  /**
  * @description 数字操作，
  * @return {string} 返回处理后的数字
  */
  formatNum: function (n) {
    if (n < 10) return '0' + n;
    return n;
  },
  /**
  * @description 将字符串转换为日期，支持格式y-m-d ymd (y m r)以及标准的
  * @return {Date} 返回日期对象
  */
  parse: function (dateStr, formatStr) {
    if (typeof dateStr === 'undefined') return null;
    if (typeof formatStr === 'string') {
      var _d = new Date(formatStr);
      //首先取得顺序相关字符串
      var arrStr = formatStr.replace(/[^ymd]/g, '').split('');
      if (!arrStr && arrStr.length != 3) return null;

      var formatStr = formatStr.replace(/y|m|d/g, function (k) {
        switch (k) {
          case 'y': return '(\\d{4})';
          case 'm': ;
          case 'd': return '(\\d{1,2})';
        }
      });

      var reg = new RegExp(formatStr, 'g');
      var arr = reg.exec(dateStr)

      var dateObj = {};
      for (var i = 0, len = arrStr.length; i < len; i++) {
        dateObj[arrStr[i]] = arr[i + 1];
      }
      return new Date(dateObj['y'], dateObj['m'] - 1, dateObj['d']);
    }
    return null;
  },
  /**
  * @description将日期格式化为字符串
  * @return {string} 常用格式化字符串
  */
  format: function (date, format) {
    if (arguments.length < 2 && !date.getTime) {
      format = date;
      date = new Date();
    }
    typeof format != 'string' && (format = 'Y年M月D日 H时F分S秒');
    return format.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function (a) {
      switch (a) {
        case "y": return (date.getFullYear() + "").slice(2);
        case "Y": return date.getFullYear();
        case "m": return date.getMonth() + 1;
        case "M": return dateUtil.formatNum(date.getMonth() + 1);
        case "d": return date.getDate();
        case "D": return dateUtil.formatNum(date.getDate());
        case "h": return date.getHours();
        case "H": return dateUtil.formatNum(date.getHours());
        case "f": return date.getMinutes();
        case "F": return dateUtil.formatNum(date.getMinutes());
        case "s": return date.getSeconds();
        case "S": return dateUtil.formatNum(date.getSeconds());
      }
    });
  },
  // @description 是否为为日期对象，该方法可能有坑，使用需要慎重
  // @param year {num} 日期对象
  // @return {boolean} 返回值
  isDate: function (d) {
    if ((typeof d == 'object') && (d instanceof Date)) return true;
    return false;
  },
  // @description 是否为闰年
  // @param year {num} 可能是年份或者为一个date时间
  // @return {boolean} 返回值
  isLeapYear: function (year) {
    //传入为时间格式需要处理
    if (dateUtil.isDate(year)) year = year.getFullYear()
    if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) return true;
    else return false;
  },

  // @description 获取一个月份的天数
  // @param year {num} 可能是年份或者为一个date时间
  // @param year {num} 月份
  // @return {num} 返回天数
  getDaysOfMonth: function (year, month) {
    //自动减一以便操作
    month--;
    if (dateUtil.isDate(year)) {
      month = year.getMonth(); //注意此处月份要加1，所以我们要减一
      year = year.getFullYear();
    }
    return [31, dateUtil.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  },

  // @description 获取一个月份1号是星期几，注意此时的月份传入时需要自主减一
  // @param year {num} 可能是年份或者为一个date时间
  // @param year {num} 月份
  // @return {num} 当月一号为星期几0-6
  getBeginDayOfMouth: function (year, month) {
    //自动减一以便操作
    month--;
    if ((typeof year == 'object') && (year instanceof Date)) {
      month = year.getMonth(); 
      year = year.getFullYear();
    }
    var d = new Date(year, month, 1);
    return d.getDay();
  }
};









