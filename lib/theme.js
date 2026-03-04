/**
 * theme.js - Theme (colour scheme) helper
 *
 * Reads the saved theme preference and applies it to <html> via a
 * data-theme attribute so that CSS can target it with attribute selectors.
 *
 *   data-theme="light"  → force light mode
 *   data-theme="dark"   → force dark mode
 *   (no attribute)      → follow @media (prefers-color-scheme: dark)
 *
 * Supported values: "auto" | "light" | "dark"
 * Default: "auto"
 */
const Theme = (() => {
  "use strict";

  const SUPPORTED = ["auto", "light", "dark"];
  const DEFAULT   = "auto";

  /**
   * Load saved theme from storage and apply it to <html>.
   * Must be awaited once near the top of each page script.
   */
  async function init() {
    const result  = await browser.storage.local.get("settings");
    const theme   = result.settings && result.settings.theme;
    const resolved = SUPPORTED.includes(theme) ? theme : DEFAULT;
    apply(resolved);
  }

  /**
   * Apply a theme value immediately (without reading storage).
   * Called by options page on radio change so the preview is instant.
   */
  function apply(theme) {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  return { init, apply };
})();
