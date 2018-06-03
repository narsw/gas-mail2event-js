# gas-mail2event-js
Google Apps ScriptにてGMailのメールから予定表にイベントを追加する

## 使用言語
- Google Apps Script （Javascript）

## コード構成
- mail2cal.js  
メイン関数であるmail2ｃａｌ関数のあるファイル
- mailEvent.js  
メール本文からイベント情報を抽出する処理を行うmailEventクラス
- mailEvent4amzn.js  
mailEventクラスを継承してAmazonのメールに対応させたクラス
- mailEvent4careco.js  
mailEventクラスを継承してCarecoのメールに対応させたクラス
- utils.js  
Tool的な関数をまとめたファイル

## 他サービスへの対応時の変更ポイント
1. `mailEvent`クラスを継承したクラス「mailEvent4xxxxx」を作成
```
// Amazon用クラスの作成
var mailEvent4amzn = function(){}
// Amazon用にクラスを継承
mailEvent4amzn.prototype = new mailEvent();
// Amazon用にメソッドをオーバーライド
mailEvent4amzn.prototype.getEvent = function(message){
// メールから日程、内容を抽出する処理
};
```
2.`mail2ｃａｌ`関数に下記のように追加したサービスの処理を追記  
- インスタンス化
- 検索語句の設定
- 予定表に記載するタイトル設定
- メール検索
```
  // Amazonのイベント検索
  var amzn = new mailEvent4amzn();
  amzn.setCriteria("is:unread from:(Amazon.co.jp) ご注文の確認");
  amzn.setTitle("Amazon荷物");
  searchEvent(amzn);
```

# 参考にしたサイト  
下記サイトを参考にし、コードに含めています。  
- http://gawawa124.hatenablog.com/entry/2017/06/15/155242
- https://www.sejuku.net/blog/23064
