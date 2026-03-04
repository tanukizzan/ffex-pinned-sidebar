/**
 * i18n.js - Internationalisation helper
 *
 * Provides a synchronous t(key) function that returns the translated string
 * for the currently active language.  Language is loaded once via init()
 * and cached for the lifetime of the page.
 *
 * Supported languages: "en" (English), "ja" (Japanese)
 * Fallback: "en"
 */
const I18n = (() => {
  "use strict";

  const MESSAGES = {
    en: {
      // App
      appName: "Pinned Sidebar",

      // Popup
      popupSettingsTitle: "Settings",
      popupEmptyLine1: "No sites pinned yet.",
      popupEmptyLine2: "Add a site below to get started.",
      popupAddPlaceholder: "https://example.com",
      popupAddBtn: "Add",
      popupRemoveTitle: "Remove",
      popupErrorAlreadyPinned: "This site is already pinned.",
      popupErrorInvalidUrl: "Invalid URL. Please enter a full URL (e.g. https://example.com).",
      popupInfoReopen: "Close and reopen the sidebar to switch sites.",

      // Options
      optionsTitle: "Pinned Sidebar Settings",
      optionsStartupSection: "Startup Behavior",
      optionsStartupDesc: "Choose what to display when the sidebar opens.",
      optionsLastVisited: "Open the last visited site",
      optionsDefaultSite: "Always open a specific default site",
      optionsDefaultSiteLabel: "Default site:",
      optionsDefaultSitePlaceholder: "-- Select a pinned site --",
      optionsPinnedSection: "Pinned Sites",
      optionsNoPins: "No sites pinned yet.",
      optionsAddPlaceholder: "https://example.com",
      optionsAddBtn: "Add Site",
      optionsRemoveBtn: "Remove",
      optionsErrorAlreadyPinned: "This site is already pinned.",
      optionsErrorInvalidUrl: "Invalid URL. Please enter a full URL (e.g. https://example.com).",
      optionsSavedSettings: "Settings saved.",
      optionsSiteAdded: "Site added.",
      optionsSiteRemoved: "Site removed.",
      optionsLanguageSection: "Language",
      optionsLanguageDesc: "Choose the UI language.",
      optionsLangEn: "English",
      optionsLangJa: "日本語",

      // Theme
      optionsThemeSection: "Appearance",
      optionsThemeDesc: "Choose the colour scheme.",
      optionsThemeAuto: "Follow browser setting",
      optionsThemeLight: "Light",
      optionsThemeDark: "Dark",

      // Sidebar placeholder
      sidebarNoPins: "No sites pinned yet.",
      sidebarNoPinsHint: "Click the toolbar icon to add one.",
    },

    ja: {
      // App
      appName: "Pinned Sidebar",

      // Popup
      popupSettingsTitle: "設定",
      popupEmptyLine1: "サイトがピン留めされていません。",
      popupEmptyLine2: "下のフォームからサイトを追加してください。",
      popupAddPlaceholder: "https://example.com",
      popupAddBtn: "追加",
      popupRemoveTitle: "削除",
      popupErrorAlreadyPinned: "このサイトはすでにピン留めされています。",
      popupErrorInvalidUrl: "URLが無効です。完全なURL（例: https://example.com）を入力してください。",
      popupInfoReopen: "サイトを切り替えるには、サイドバーを閉じて開き直してください。",

      // Options
      optionsTitle: "Pinned Sidebar 設定",
      optionsStartupSection: "起動時の動作",
      optionsStartupDesc: "サイドバーを開いたときに表示するサイトを選択してください。",
      optionsLastVisited: "最後に表示したサイトを開く",
      optionsDefaultSite: "常に特定のサイトを開く",
      optionsDefaultSiteLabel: "デフォルトサイト:",
      optionsDefaultSitePlaceholder: "-- サイトを選択 --",
      optionsPinnedSection: "ピン留めサイト",
      optionsNoPins: "サイトがピン留めされていません。",
      optionsAddPlaceholder: "https://example.com",
      optionsAddBtn: "サイトを追加",
      optionsRemoveBtn: "削除",
      optionsErrorAlreadyPinned: "このサイトはすでにピン留めされています。",
      optionsErrorInvalidUrl: "URLが無効です。完全なURL（例: https://example.com）を入力してください。",
      optionsSavedSettings: "設定を保存しました。",
      optionsSiteAdded: "サイトを追加しました。",
      optionsSiteRemoved: "サイトを削除しました。",
      optionsLanguageSection: "言語",
      optionsLanguageDesc: "UIの言語を選択してください。",
      optionsLangEn: "English",
      optionsLangJa: "日本語",

      // Theme
      optionsThemeSection: "外観",
      optionsThemeDesc: "カラースキームを選択してください。",
      optionsThemeAuto: "ブラウザの設定に合わせる",
      optionsThemeLight: "ライトモード",
      optionsThemeDark: "ダークモード",

      // Sidebar placeholder
      sidebarNoPins: "サイトがピン留めされていません。",
      sidebarNoPinsHint: "ツールバーアイコンをクリックして追加してください。",
    },
  };

  const SUPPORTED = ["en", "ja"];
  const FALLBACK = "en";

  let _lang = FALLBACK;

  /**
   * Load the saved language from storage.
   * Must be awaited once before calling t().
   */
  async function init() {
    const result = await browser.storage.local.get("settings");
    const lang = result.settings && result.settings.language;
    _lang = SUPPORTED.includes(lang) ? lang : FALLBACK;
  }

  /**
   * Return the translated string for key in the current language.
   * Falls back to English if the key is missing in the active language.
   */
  function t(key) {
    return (
      (MESSAGES[_lang] && MESSAGES[_lang][key]) ||
      (MESSAGES[FALLBACK] && MESSAGES[FALLBACK][key]) ||
      key
    );
  }

  /** Return the current language code. */
  function getLanguage() {
    return _lang;
  }

  return { init, t, getLanguage };
})();
