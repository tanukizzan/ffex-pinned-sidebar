# Pinned Sidebar

A Firefox extension that lets you pin your favorite websites to the sidebar for instant access.

Pinned Sidebar をサイドバーに表示するための Firefox 拡張機能です。よく使うサイトをピン留めしてサイドバーからすばやくアクセスできます。

---

## Features / 機能

- **Pin any site** — Add any URL to your personal pin list and open it in the sidebar with one click.  
  **サイトをピン留め** — URLをピンリストに追加し、1クリックでサイドバーに表示。

- **Native navigation, no iframes** — The sidebar navigates directly to the target URL instead of wrapping it in an iframe, so sites that block embedding (X-Frame-Options / CSP) work without issues.  
  **ネイティブナビゲーション（iframeなし）** — サイドバーが対象URLに直接ナビゲートするため、X-Frame-Options / CSP でiframeを禁止しているサイトも問題なく表示されます。

- **Startup behavior** — Choose to reopen the last visited site automatically, or always open a fixed default site.  
  **起動時の動作** — 最後に表示したサイトを自動で開くか、固定のデフォルトサイトを開くかを選択できます。

- **Appearance** — Light, dark, or auto (follows the browser theme).  
  **外観** — ライト・ダーク・自動（ブラウザのテーマに追従）から選択できます。

- **Language** — English and Japanese UI.  
  **言語** — 英語・日本語に対応。

---

## Installation / インストール

This extension is not listed on addons.mozilla.org. Install it manually as a temporary add-on or as a signed package.

この拡張機能はアドオンストアには公開されていません。以下の手順で手動インストールしてください。

### Temporary installation (for development) / 一時インストール（開発用）

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.  
   Firefox で `about:debugging#/runtime/this-firefox` を開きます。
2. Click **Load Temporary Add-on…**  
   **一時的なアドオンを読み込む…** をクリックします。
3. Select the `manifest.json` file in this repository.  
   このリポジトリの `manifest.json` を選択します。

> **Note:** Temporary add-ons are removed when Firefox is closed.  
> **注意:** 一時インストールは Firefox を閉じると削除されます。

---

## Usage / 使い方

1. Click the **Pinned Sidebar** button in the Firefox toolbar to open the popup.  
   Firefox ツールバーの **Pinned Sidebar** ボタンをクリックしてポップアップを開きます。
2. Type a URL in the input field and press **Add** (or Enter) to pin a site.  
   入力欄にURLを入力し **Add**（またはEnter）を押してサイトをピン留めします。
3. Click a pinned site in the list to open it in the sidebar.  
   リスト内のピン留めサイトをクリックするとサイドバーに表示されます。
4. Click the **×** button on a site to remove it from the list.  
   サイト横の **×** ボタンでピンを削除できます。
5. Open **Settings** (⚙ icon) to manage pins, startup behavior, language, and appearance.  
   **設定**（⚙アイコン）からピン管理・起動動作・言語・外観を変更できます。

---

## Project Structure / ファイル構成

```
├── manifest.json               # Extension manifest (Manifest V2)
├── background/
│   └── background.js           # Event page: active site state, message routing
├── sidebar/
│   ├── sidebar.html
│   └── sidebar.js              # Navigates sidebar to the active site URL
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js                # Toolbar popup: pin list, add/remove
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js              # Settings page
├── components/
│   └── pin-manager.js          # Pinned sites CRUD
├── lib/
│   ├── storage.js              # browser.storage.local wrapper
│   ├── i18n.js                 # Internationalisation (en / ja)
│   └── theme.js                # Theme helper (auto / light / dark)
└── icons/
    ├── icon-16.svg
    ├── icon-48.svg
    └── icon-128.svg
```

---

## How It Works / 動作の仕組み

When a pinned site is selected, the background script records it as the active site. The sidebar panel (`sidebar.html`) then calls `window.location.replace()` to navigate directly to that URL — turning the sidebar itself into the target website. This avoids all iframe-based embedding restrictions.

ピン留めサイトを選択すると、バックグラウンドスクリプトがアクティブサイトとして記録します。サイドバーパネル（`sidebar.html`）は `window.location.replace()` で対象URLに直接ナビゲートし、サイドバー自体をそのWebサイトとして表示します。これによりiframeの埋め込み制限（X-Frame-Options / CSP）を完全に回避します。

---

## Requirements / 動作環境

- Firefox (Manifest V2)

---

## License / ライセンス

MIT
