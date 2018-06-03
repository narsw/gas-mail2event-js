/* ############################
GMail2Event
Auther: Naruaki Shimizu
 ############################ */

/* -----------------------------
mailEventクラス
メール内容からイベント情報を抽出する
親クラス：なし
 ----------------------------- */
var mailEvent = function(){
  this.criteria = "";
  this.title = "";
  this.startDate = new Date();
  this.endDate = new Date();
  this.description = "";
  this.isAllDay = false;
  this.searchRange = 30;
  
  // メソッドを定義:メール・メッセージからイベント日程、内容を取得
  this.getEvent = function(){}
}

/* -----------------------------
setTitleメソッド
タイトルを設定する
引数：
<String型>title
返り値：なし
 ----------------------------- */
mailEvent.prototype.setTitle = function(title){
  this.title = title;
}

/* -----------------------------
setCriteriaメソッド
検索語句を設定する
自動的に期間が付与される
引数：
<String型>criteria
返り値：なし
 ----------------------------- */
mailEvent.prototype.setCriteria = function(criteria){
  //期間を付与
  var rangeDate = new Date();
  rangeDate.setDate(rangeDate.getDate()+1); // 明日の日付
  var beforeDate = date2str(rangeDate, "YYYY/MM/DD", false)
  rangeDate.setDate(rangeDate.getDate()-this.searchRange);
  var afterDate = date2str(rangeDate, "YYYY/MM/DD", false)
  
  this.criteria　= criteria+" after:"+afterDate+" before:"+beforeDate;
}

/* -----------------------------
mailEvent4amznクラス
Amazonの注文メール内容からイベント情報を抽出する
親クラス：mailEvent
 ----------------------------- */
// Amazon用クラスの作成
var mailEvent4amzn = function(){}
// Amazon用にクラスを継承
mailEvent4amzn.prototype = new mailEvent();
// Amazon用にメソッドをオーバーライド
/* -----------------------------
getEventメソッド
メッセージから日程と予約番号を取得する
日程をstartDate,endDateに設定
終日の場合はisAllDayにフラグ設定
予約番号をdescriptionに設定
引数：
<message型>message
返り値：
<boolean型>
 ----------------------------- */
mailEvent4amzn.prototype.getEvent = function(message){
  var dateExp_datetime = /\d{2}\/\d{2}\s\d{2}:\d{2}/g; // ex. 06/15 16:00
  var dateExp_date = /曜日,\s\d{2}\/\d{2}/g; // ex. 06/15 16:00
  var dateExpWithSubString = /(\d{2})\/(\d{2})\s(\d{2}):(\d{2})/; // 日時分解
  var orderNoExp = /注文番号：\s(\d{3}-\d{7}-\d{7})/;
  
  var body = message.getPlainBody(); //getBodyだとHTMLメールのため
  if (!(body.match(/お届け予定/))) {
    // Kindleの注文を除くため
    return false;
  }
  
  // 注文番号を取得
  var orderNo = body.match(orderNoExp);
  var strOrderNo = ""
  if(orderNo.length == 2){
    strOrderNo = orderNo[1];
  }
  
  var year = message.getDate().getFullYear();
  this.isAllDay = false;
  // 日付、時刻が記載されている場合 ex. [06/15 16:00, 06/15 18:00]
  var dateArray = body.match(dateExp_datetime);
  if (dateArray == null) {
    //　日付のみ記載の場合 ex. [曜日， 06/15, 曜日， 06/17]
    dateArray = body.match(dateExp_date);
    if (dateArray != null) {
      this.isAllDay = true;
      if (dateArray.length == 2) { // 日付（期間）の場合
        dateArray[0]　= dateArray[0].replace(/曜日,\s/,'')+' 00:00'; //送付日が期間の場合（6/15 - 6/16）
        dateArray[1]　= dateArray[1].replace(/曜日,\s/,'')+' 23:59';
      }else if (dateArray.length == 1){ // 日付（1日）の場合
        var tmpDate = dateArray[0].replace(/曜日,\s/,'');
        dateArray[0]　= tmpDate + ' 00:00'; //送付日が単一日の場合(6/16)
        dateArray.push(tmpDate + ' 23:59');
      }
    }
  }
  
  if (dateArray != null){
    // 日付文字列を分解し、Date型に変換
    var [sMatched, sMonth, sDay, sHour, sMin] = dateArray[0].match(dateExpWithSubString);
    var [eMatched, eMonth, eDay, eHour, eMin] = dateArray[1].match(dateExpWithSubString);
    this.startDate = new Date(year, sMonth - 1, sDay, sHour, sMin);
    this.endDate = new Date(year, eMonth - 1, eDay, eHour, eMin);
    // Descriptionに注文番号情報を設定
    this.description = "注文番号:"+strOrderNo;
  }else{
    return false;
  }
  
  return true;
}

/* -----------------------------
mailEvent4carecoクラス
カレコの予約メール内容からイベント情報を抽出する
親クラス：mailEvent
 ----------------------------- */
// Careco用クラスの作成
var mailEvent4careco = function(){};
// Careco用クラスの継承
mailEvent4careco.prototype = new mailEvent();
// Careco用にメッソドのオーバーライド
/* -----------------------------
getEventメソッド
メッセージから日程と予約番号を取得する
引数：
<message型>message
返り値：
<boolean型>
 ----------------------------- */
mailEvent4careco.prototype.getEvent = function(message){
  var dateExp_datetime = /(\d{4}\/\d{2}\/\d{2}.{4}\d{2}:\d{2})/g;
  var dateExpWithSubString = /(\d{4})\/(\d{2})\/(\d{2}).{4}(\d{2}):(\d{2})/; // 日時分解
  var reserveNoExp = /予約ID:\s(\d{7})/;
  
  var body = message.getPlainBody(); //getBodyだとHTMLメールのため
  // 予約番号を取得
  var reserveNo = body.match(reserveNoExp);
  var strReserveNo = ""
  if(reserveNo.length == 2){
    strReserveNo = reserveNo[1];
  }
  
  this.isAllDay = false;
  // 日付、時刻を取得 ex. [2018/05/26(土) 19:40,2018/05/26(土) 23:40]
  var dateArray = body.match(dateExp_datetime);
  if (dateArray == null) {
    // 日時が取れなければエラー
    return false;
  }else if(dateArray.length != 2){
    // 日時が2つ取れなければエラー
    return false;
  }else{
    // 日付文字列を分解し、Date型に変換
    var [sMatched, sYear, sMonth, sDay, sHour, sMin] = dateArray[0].match(dateExpWithSubString);
    var [eMatched, eYear, eMonth, eDay, eHour, eMin] = dateArray[1].match(dateExpWithSubString);
    this.startDate = new Date(sYear, sMonth - 1, sDay, sHour, sMin);
    this.endDate = new Date(eYear, eMonth - 1, eDay, eHour, eMin);
    // Descriptionに予約番号情報を設定
    this.description = "予約番号:"+strReserveNo;
  }
  
  return true;
}

/* -----------------------------
mail2calメソッド
Gmailから予定表にイベント登録する
引数：なし
返り値：なし
 ----------------------------- */
function mail2cal() {
  // Criteriaは基本的に「is:unread」を含めて指定し、既読/未読で登録済みの管理をする
  // Amazonのイベント検索
  var amzn = new mailEvent4amzn();
  amzn.setCriteria("is:unread from:(Amazon.co.jp) ご注文の確認");
  amzn.setTitle("Amazon荷物");
  searchEvent(amzn);
  
  // Carecoのイベント検索
  var crc = new mailEvent4careco();
  crc.setCriteria("is:unread from:(reservation@careco.jp) クルマのご予約を受付けました ");
  crc.setTitle("カレコ車予約");
  searchEvent(crc);
};

/* -----------------------------
searchEventメソッド
Gmailからイベントを検索し、予定表に登録する
引数：
<mailEvent型>mailEvent
返り値：なし
 ----------------------------- */
function searchEvent(mailEvent){
  Logger.log(mailEvent.criteria);
  
  //メール検索
  var cntEvent = 0
  GmailApp.search(mailEvent.criteria).forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      // メールから予定情報の抽出
      var result = mailEvent.getEvent(message);

      if(result){
        cntEvent++;
        // 予定表への登録
        createCalenderEvent(mailEvent.title, mailEvent.startDate, mailEvent.endDate, mailEvent.description, mailEvent.isAllDay);
        // メールを既読へ変更
        message.markRead();
        
        Logger.log("タイトル："+mailEvent.title+"　内容："+mailEvent.description);
        if(mailEvent.isAllDay){
          Logger.log("終日："+date2str(mailEvent.startDate,"YYYY/MM/DD",false)+" 〜 "+date2str(mailEvent.endDate,"YYYY/MM/DD",false));
        }else{
          Logger.log("日程："+date2str(mailEvent.startDate,"",false)+" 〜 "+date2str(mailEvent.endDate,"",false));
        }
      }
    });
  });
  Logger.log("追加イベント数："+cntEvent);
}

/* -----------------------------
createCalenderEventメソッド
予定表にイベント登録する
引数：
<String型>title
<Date型>startDate
<Date型>endDate
<String型>description
<Boolean型>isAllDay
返り値：なし
 ----------------------------- */
function createCalenderEvent(title, startDate, endDate, description, isAllDay){
  // イベントの作成
  if(isAllDay){ 
    if(date2str(startDate,"YYYY/MM/DD",false) == date2str(endDate,"YYYY/MM/DD",false)){
      // 【終日】開始、終了日が同日の場合
      var event = CalendarApp.getDefaultCalendar().createAllDayEvent(title, startDate, { description : description　});
    }else{
      // 【終日】開始、終了日が異なる場合
      var event = CalendarApp.getDefaultCalendar().createAllDayEvent(title, startDate, endDate, { description : description　});
    }
  }else{
    var event = CalendarApp.getDefaultCalendar().createEvent(title, startDate, endDate, { description : description　});
  }
}

// Util
/* -----------------------------
date2strメソッド
Date型からフォーマットに従ってString型で返す
引数：
<Date型>date
<String型>format
<Boolean型>is12hours
返り値：<String型>
 ----------------------------- */
function date2str(date, format, is12hours) {
  var weekday = ["日", "月", "火", "水", "木", "金", "土"];
  if (!format) {
    format = 'YYYY/MM/DD(WW) hh:mm:ss'
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