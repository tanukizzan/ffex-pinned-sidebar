# Pinned Sidebar

よく使うウェブサイトをサイドバーにピン留めして、すばやくアクセスできる Firefox 拡張機能です。

> **[Firefox Add-ons (AMO) からインストール](_AMO_URL_PLACEHOLDER_)**
> <!-- 公開後に上記 URL を置き換えてください -->

[English README](README.md)

---

## 機能

- **サイトをピン留め** — URLをピンリストに追加し、1クリックでサイドバーに表示。
- **ネイティブナビゲーション（iframeなし）** — サイドバーが対象URLに直接ナビゲートするため、X-Frame-Options / CSP でiframeを禁止しているサイトも問題なく表示されます。
- **起動時の動作** — 最後に表示したサイトを自動で開くか、固定のデフォルトサイトを開くかを選択できます。
- **外観** — ライト・ダーク・自動（ブラウザのテーマに追従）から選択できます。
- **言語** — 英語・日本語に対応。

---

## インストール

### Firefox Add-ons (AMO) から

1. [AMO の拡張機能ページ](_AMO_URL_PLACEHOLDER_) を開きます。
2. **Firefox に追加** をクリックし、権限の確認ダイアログで許可します。

### 手動インストール（開発用）

1. Firefox で `about:debugging#/runtime/this-firefox` を開きます。
2. **一時的なアドオンを読み込む…** をクリックします。
3. このリポジトリの `manifest.json` を選択します。

> **注意:** 一時インストールは Firefox を閉じると削除されます。

---

## 使い方

1. Firefox ツールバーの **Pinned Sidebar** ボタンをクリックしてポップアップを開きます。
2. 入力欄に URL を入力し、**Add**（または Enter）を押してサイトをピン留めします。
3. リスト内のピン留めサイトをクリックするとサイドバーに表示されます。
4. サイト横の **×** ボタンでピンを削除できます。
5. **設定**（⚙ アイコン）からピン管理・起動動作・言語・外観を変更できます。

---

## ファイル構成

```
├── manifest.json               # 拡張機能マニフェスト（Manifest V3）
├── background/
│   └── background.js           # イベントページ: アクティブサイト管理・メッセージルーティング
├── sidebar/
│   ├── sidebar.html
│   ├── sidebar.css
│   └── sidebar.js              # サイドバーを対象 URL にナビゲート
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js                # ツールバーポップアップ: ピンリスト・追加/削除
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js              # 設定ページ
├── components/
│   └── pin-manager.js          # ピン留めサイトの CRUD 操作
├── lib/
│   ├── storage.js              # browser.storage.local ラッパー
│   ├── i18n.js                 # 国際化（英語・日本語）
│   └── theme.js                # テーマヘルパー（自動・ライト・ダーク）
└── icons/
    ├── icon-16.svg
    ├── icon-48.svg
    └── icon-128.svg
```

---

## 動作の仕組み

ピン留めサイトを選択すると、バックグラウンドスクリプトがそのサイトをアクティブとして記録します。サイドバーパネル（`sidebar.html`）は `window.location.replace()` で対象 URL に直接ナビゲートし、サイドバー自体をそのウェブサイトとして表示します。これにより X-Frame-Options / CSP によるiframeの埋め込み制限を完全に回避します。

サイドバーが空の状態（プレースホルダー表示中）に初めてピンを追加した場合は、ポップアップがバックグラウンドスクリプト経由で `navigateSidebar` メッセージを送信し、サイドバーの再オープン不要で即座にナビゲートします。

---

## 動作環境

- Firefox（Manifest V3）

---

## ライセンス

MIT
