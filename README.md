# Pinned Sidebar

A Firefox extension that lets you pin your favorite websites to the sidebar for instant access.

> **[Install from Firefox Add-ons (AMO)](_AMO_URL_PLACEHOLDER_)**
> <!-- Replace the URL above once the listing is live -->

[日本語版 README はこちら](README-ja.md)

---

## Features

- **Pin any site** — Add any URL to your personal pin list and open it in the sidebar with one click.
- **Native navigation, no iframes** — The sidebar navigates directly to the target URL instead of wrapping it in an iframe, so sites that block embedding (X-Frame-Options / CSP) work without issues.
- **Startup behavior** — Choose to reopen the last visited site automatically, or always open a fixed default site.
- **Appearance** — Light, dark, or auto (follows the browser theme).
- **Language** — English and Japanese UI.

---

## Installation

### From Firefox Add-ons (AMO)

1. Visit the [extension page on AMO](_AMO_URL_PLACEHOLDER_).
2. Click **Add to Firefox** and confirm the permission prompt.

### Manual installation (for development)

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**
3. Select the `manifest.json` file in this repository.

> **Note:** Temporary add-ons are removed when Firefox is closed.

---

## Usage

1. Click the **Pinned Sidebar** toolbar button to open the popup.
2. Type a URL in the input field and press **Add** (or Enter) to pin a site.
3. Click a pinned site in the list to open it in the sidebar.
4. Click the **×** button next to a site to remove it.
5. Open **Settings** (⚙ icon) to manage pins, startup behavior, language, and appearance.

---

## Project Structure

```
├── manifest.json               # Extension manifest (Manifest V3)
├── background/
│   └── background.js           # Event page: active site state, message routing
├── sidebar/
│   ├── sidebar.html
│   ├── sidebar.css
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

## How It Works

When a pinned site is selected, the background script records it as the active site. The sidebar panel (`sidebar.html`) then calls `window.location.replace()` to navigate directly to that URL — turning the sidebar itself into the target website. This bypasses all iframe-based embedding restrictions (X-Frame-Options / CSP) entirely.

When the first pin is added while the sidebar is open and showing the empty-state placeholder, the popup sends a `navigateSidebar` message via the background script so the sidebar navigates immediately without requiring a manual reopen.

---

## Requirements

- Firefox (Manifest V3)

---

## License

MIT
