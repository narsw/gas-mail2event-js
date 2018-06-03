/* ############################
GMail2Event
　mailEvent Class
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