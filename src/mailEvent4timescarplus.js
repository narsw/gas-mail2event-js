/* ############################
GMail2Event
　mailEvent4timescarplus Class
Auther: Naruaki Shimizu
 ############################ */

/* -----------------------------
mailEvent4timescarplusクラス
TimesCarPlusの予約メール内容からイベント情報を抽出する
親クラス：mailEvent
 ----------------------------- */
// TimesCarPlus用クラスの作成
var mailEvent4timescarplus = function(){};
// TimesCarPlus用クラスの継承
mailEvent4timescarplus.prototype = new mailEvent();
// TimesCarPlus用にメッソドのオーバーライド
/* -----------------------------
getEventメソッド
メッセージから日程と予約番号を取得する
引数：
<message型>message
返り値：
<boolean型>
 ----------------------------- */
 mailEvent4timescarplus.prototype.getEvent = function(message){
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