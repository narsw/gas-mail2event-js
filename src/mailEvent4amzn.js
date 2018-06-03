/* ############################
GMail2Event
　mailEvent4amzn Class
Auther: Naruaki Shimizu
 ############################ */

/* -----------------------------
mailEvent4amznクラス
Amazonの注文メール内容からイベント情報を抽出する
親クラス：mailEvent
 ----------------------------- */
// Amazon用クラスの作成
var mailEvent4amzn = function () { }
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
mailEvent4amzn.prototype.getEvent = function (message) {
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
  if (orderNo.length == 2) {
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
        dateArray[0] = dateArray[0].replace(/曜日,\s/, '') + ' 00:00'; //送付日が期間の場合（6/15 - 6/16）
        dateArray[1] = dateArray[1].replace(/曜日,\s/, '') + ' 23:59';
      } else if (dateArray.length == 1) { // 日付（1日）の場合
        var tmpDate = dateArray[0].replace(/曜日,\s/, '');
        dateArray[0] = tmpDate + ' 00:00'; //送付日が単一日の場合(6/16)
        dateArray.push(tmpDate + ' 23:59');
      }
    }
  }

  if (dateArray != null) {
    // 日付文字列を分解し、Date型に変換
    var [sMatched, sMonth, sDay, sHour, sMin] = dateArray[0].match(dateExpWithSubString);
    var [eMatched, eMonth, eDay, eHour, eMin] = dateArray[1].match(dateExpWithSubString);
    this.startDate = new Date(year, sMonth - 1, sDay, sHour, sMin);
    this.endDate = new Date(year, eMonth - 1, eDay, eHour, eMin);
    // Descriptionに注文番号情報を設定
    this.description = "注文番号:" + strOrderNo;
  } else {
    return false;
  }

  return true;
}