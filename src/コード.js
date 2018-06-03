var mailEvent = function(){
  this.criteria = "";
  this.ignore = "";
  this.startDate = new Date();
  this.endDate = new Date();
}

mailEvent.prototype.setCriteria = function(criteria){
  //期間を付与
  var today = new Date();
  var beforeDate = date2str(today, "YYYY/MM/DD", false)
  today.setDate(today.getDate()-1); // 昨日の日付
  var afterDate = date2str(today, "YYYY/MM/DD", false)
  
  this.criteria　= criteria+" after:"+afterDate+" before:"+beforeDate;
}

mailEvent.prototype.getEvent = function(body){
  this.criteria = "is:unread from:(Amazon.co.jp) ご注文の確認";
  var dateExp_datetime = /\d{2}\/\d{2}\s\d{2}:\d{2}/g; // ex. 06/15 16:00
  var dateExp_date = /曜日,\s\d{2}\/\d{2}/g; // ex. 06/15 16:00
  var dateExpWithSubString = /(\d{2})\/(\d{2})\s(\d{2}):(\d{2})/; // ()をつけることで部分文字列として返却される
  
  if (!(body.match(/お届け予定/))) {
    // Kindleの注文を除くため
    return;
  }
  Logger.log(body);
  var year = message.getDate().getFullYear();
  var dateArray = body.match(dateExp_datetime); // ex. [06/15 16:00, 06/15 18:00]
  if (dateArray == null) {
    dateArray = body.match(dateExp_date); // ex. [曜日， 06/15, 曜日， 06/17]
    if (dateArray != null) {
      if (dateArray.length == 2) {
        dateArray[0]　= dateArray[0].replace(/曜日,\s/,'')+' 00:00'; //送付日が期間の場合（6/15 - 6/16）
        dateArray[1]　= dateArray[1].replace(/曜日,\s/,'')+' 23:59';
      }else if (dateArray.length == 1){
        dateArray[0]　= dateArray[0].replace(/曜日,\s/,'')+' 00:00'; //送付日が単一日の場合(6/16)
        dateArray.push(dateArray[0].replace(/曜日,\s/,'')+' 23:59');
      }
    }
  }
  
  if (dateArray != null){
    var [sMatched, sMonth, sDay, sHour, sMin] = dateArray[0].match(dateExpWithSubString);
    var [eMatched, eMonth, eDay, eHour, eMin] = dateArray[1].match(dateExpWithSubString);
    this.startDate = new Date(year, sMonth - 1, sDay, sHour, sMin);
    this.endDate = new Date(year, eMonth - 1, eDay, eHour, eMin);
  }
}


function mail2cal() {
  var amzn = new mailEvent();
  amzn.setCriteria("is:unread from:(Amazon.co.jp) ご注文の確認");
  
  Logger.log(amzn.criteria);
  //メール検索
  GmailApp.search(amzn.criteria).forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      var body = message.getPlainBody(); //getBodyだとHTMLメールのため
      amzn.getEvent(body);
      Logger.log(amzn.startDate);
      Logger.log(amzn.endDate);
    });
  });
}


function createAmazonEvent() {
  var criteria = "is:unread from:(Amazon.co.jp) ご注文の確認";
  var dateExp_datetime = /\d{2}\/\d{2}\s\d{2}:\d{2}/g; // ex. 06/15 16:00
  var dateExp_date = /曜日,\s\d{2}\/\d{2}/g; // ex. 06/15 16:00
  //var dateExpWithSubString = /(\d{2})\/(\d{2})\s(\d{2}):(\d{2})/; // ()をつけることで部分文字列として返却される

  //期間を付与
  var today = new Date();
  var beforeDate = date2str(today, "YYYY/MM/DD", false)
  today.setDate(today.getDate()-1); // 昨日の日付
  var afterDate = date2str(today, "YYYY/MM/DD", false)
  criteria　= criteria+" after:"+afterDate+" before:"+beforeDate;
  
  GmailApp.search(criteria).forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      var body = message.getPlainBody(); //getBodyだとHTMLメールのため
      
      if (!(body.match(/お届け予定/))) {
        // Kindleの注文を除くため
        return;
      }
      Logger.log(body);
      var year = message.getDate().getFullYear();
      var dateArray = body.match(dateExp_datetime); // ex. [06/15 16:00, 06/15 18:00]
      if (dateArray == null) {
        dateArray = body.match(dateExp_date); // ex. [曜日， 06/15, 曜日， 06/17]
        if (dateArray != null) {         
          if (dateArray.length == 2) {
            dateArray[0]　= dateArray[0].replace(/曜日,\s/,'')+' 00:00'; //送付日が期間の場合（6/15 - 6/16）
            dateArray[1]　= dateArray[1].replace(/曜日,\s/,'')+' 23:59';
          }else if (dateArray.length == 1){
            dateArray[0]　= dateArray[0].replace(/曜日,\s/,'')+' 00:00'; //送付日が単一日の場合(6/16)
            dateArray.push(dateArray[0].replace(/曜日,\s/,'')+' 23:59');
          }
        }
      }

      Logger.log(dateArray);
      
      if (dateArray != null){
        var [sMatched, sMonth, sDay, sHour, sMin] = dateArray[0].match(dateExpWithSubString);
        var [eMatched, eMonth, eDay, eHour, eMin] = dateArray[1].match(dateExpWithSubString);
        var startDate = new Date(year, sMonth - 1, sDay, sHour, sMin);
        var endDate = new Date(year, eMonth - 1, eDay, eHour, eMin);
        createCalenderEvent(startDate, endDate, "Amazon荷物", "Amazon荷物配送日程");
        message.markRead();
      }
    });
  });
}

function createCalenderEvent(startDate, endDate, title, description){
  // イベントの作成
  var event = CalendarApp.getDefaultCalendar().createEvent(title, startDate, endDate, { Descrioption : description});
  Logger.log(event.getId());
}

// Util
function date2str(date, format, is12hours) {
  var weekday = ["日", "月", "火", "水", "木", "金", "土"];
  if (!format) {
    format = 'YYYY/MM/DD(WW) hh:mm:dd'
  }
  var year = date.getFullYear();
  var month = (date.getMonth() + 1);
  var day = date.getDate();
  var weekday = weekday[date.getDay()];
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var secounds = date.getSeconds();
  
  var ampm = hours < 12 ? 'AM' : 'PM';
  if (is12hours) {
    hours = hours % 12;
    hours = (hours != 0) ? hours : 12; // 0時は12時と表示する
  }
  
  var replaceStrArray =
      {
        'YYYY': year,
        'Y': year,
        'MM': ('0' + (month)).slice(-2),
        'M': month,
        'DD': ('0' + (day)).slice(-2),
        'D': day,
        'WW': weekday,
        'hh': ('0' + hours).slice(-2),
        'h': hours,
        'mm': ('0' + minutes).slice(-2),
        'm': minutes,
        'ss': ('0' + secounds).slice(-2),
        's': secounds,
        'AP': ampm,
      };
  
  var replaceStr = '(' + Object.keys(replaceStrArray).join('|') + ')';
  var regex = new RegExp(replaceStr, 'g');
 
  
  ret = format.replace(regex, function (str) {
    return replaceStrArray[str];
  });
  
  return ret;
}