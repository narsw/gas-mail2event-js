/* ############################
GMail2Event
 Development
Auther: Naruaki Shimizu
 ############################ */

/* -----------------------------
mail2calメソッド(開発用)
Gmailから予定表にイベント登録する
引数：なし
返り値：なし
 ----------------------------- */
function mail2cal_develop() {
    // Criteriaは基本的に「is:unread」を含めて指定し、既読/未読で登録済みの管理をする
    // TimesCarPlusのイベント検索
    var tcp = new mailEvent4timescarplus();
    //tcp.setCriteria("is:unread from:(inquiry@plus.timescar.jp) 【Times Car PLUS】予約登録完了");
    tcp.setCriteria("is:unread from:(inquiry@plus.timescar.jp) 【Times Car PLUS】予約登録完了");
    tcp.setTitle("タイムズ車予約");
    searchEvent(tcp);
};