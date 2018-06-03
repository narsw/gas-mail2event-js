/* ############################
GMail2Event
Auther: Naruaki Shimizu
 ############################ */

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

  // TimesCarPlusのイベント検索
  var tcp = new mailEvent4timescarplus();
  tcp.setCriteria("is:unread from:(inquiry@plus.timescar.jp) 【Times Car PLUS】予約登録完了");
  tcp.setTitle("タイムズ車予約");
  searchEvent(tcp);
};

/* -----------------------------
searchEventメソッド
Gmailからイベントを検索し、予定表に登録する
引数：
<mailEvent型>mailEvent
返り値：なし
 ----------------------------- */
function searchEvent(mailEvent) {
  Logger.log(mailEvent.criteria);

  //メール検索
  var cntEvent = 0
  GmailApp.search(mailEvent.criteria).forEach(function (thread) {
    var messages = thread.getMessages();
    messages.forEach(function (message) {
      // メールから予定情報の抽出
      var result = mailEvent.getEvent(message);

      if (result) {
        cntEvent++;
        // 予定表への登録
        createCalenderEvent(mailEvent.title, mailEvent.startDate, mailEvent.endDate, mailEvent.description, mailEvent.isAllDay);
        // メールを既読へ変更
        message.markRead();

        Logger.log("タイトル：" + mailEvent.title + "　内容：" + mailEvent.description);
        if (mailEvent.isAllDay) {
          Logger.log("終日：" + date2str(mailEvent.startDate, "YYYY/MM/DD", false) + " 〜 " + date2str(mailEvent.endDate, "YYYY/MM/DD", false));
        } else {
          Logger.log("日程：" + date2str(mailEvent.startDate, "", false) + " 〜 " + date2str(mailEvent.endDate, "", false));
        }
      }
    });
  });
  Logger.log("追加イベント数：" + cntEvent);
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
function createCalenderEvent(title, startDate, endDate, description, isAllDay) {
  // イベントの作成
  if (isAllDay) {
    if (date2str(startDate, "YYYY/MM/DD", false) == date2str(endDate, "YYYY/MM/DD", false)) {
      // 【終日】開始、終了日が同日の場合
      var event = CalendarApp.getDefaultCalendar().createAllDayEvent(title, startDate, { description: description });
    } else {
      // 【終日】開始、終了日が異なる場合
      var event = CalendarApp.getDefaultCalendar().createAllDayEvent(title, startDate, endDate, { description: description });
    }
  } else {
    var event = CalendarApp.getDefaultCalendar().createEvent(title, startDate, endDate, { description: description });
  }
}
