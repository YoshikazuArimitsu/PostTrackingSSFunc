# 郵便追跡スクリーンショット取得 Function API

日本郵政の郵便追跡サービス(https://trackings.post.japanpost.jp/services/src/search/input) で指定の郵便物の到達状況を取得し、
ページのスクリーンショット(PNG/PDF)を採取する API。

## メモ

- Azure の AppService/Functions の Windows ベースのマネージドサービスでは GDI 系 API は使えない。  
  → ヘッドレスブラウザ系は動かない。Linux なら大丈夫。

  https://github.com/projectkudu/kudu/wiki/Azure-Web-App-sandbox#win32ksys-user32gdi32-restrictions

- 日本語フォントも使えない(描画自体できない前提なんだから当たり前)  
  → 日本語フォントを追加したヘッドレスブラウザ入りの Linux Docker Image を作って無理くり動かす必要がある。
