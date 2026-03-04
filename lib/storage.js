/**
 * storage.js - browser.storage.local wrapper
 *
 * Provides a clean async API for reading/writing extension data.
 * All data keys:
 *   - pinnedSites: Array<{ id, url, title, favicon }>
 *   - lastVisitedSiteId: string
 *   - settings: {
 *       openBehavior: "lastVisited"|"default",
 *       defaultSiteId: string|null,
 *       language: "en"|"ja",
 *       theme: "auto"|"light"|"dark"
 *     }
 */
const Storage = (() => {
  // ---- low-level helpers ----

  async function get(key) {
    const result = await browser.storage.local.get(key);
    return result[key];
  }

  async function set(obj) {
    return browser.storage.local.set(obj);
  }

  // ---- pinned sites ----

  async function getPinnedSites() {
    return (await get("pinnedSites")) || [];
  }

  async function savePinnedSites(sites) {
    return set({ pinnedSites: sites });
  }

  // ---- last visited ----

  async function getLastVisitedSiteId() {
    return (await get("lastVisitedSiteId")) || null;
  }

  async function saveLastVisitedSiteId(id) {
    return set({ lastVisitedSiteId: id });
  }

  // ---- settings ----

  const DEFAULT_SETTINGS = {
    openBehavior: "lastVisited", // "lastVisited" | "default"
    defaultSiteId: null,
    language: "en",              // "en" | "ja"
    theme: "auto",               // "auto" | "light" | "dark"
  };

  async function getSettings() {
    const saved = (await get("settings")) || {};
    return { ...DEFAULT_SETTINGS, ...saved };
  }

  async function saveSettings(settings) {
    const current = await getSettings();
    return set({ settings: { ...current, ...settings } });
  }

  // ---- change listener ----

  function onChange(callback) {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        callback(changes);
      }
    });
  }

  // ---- public API ----
  return {
    getPinnedSites,
    savePinnedSites,
    getLastVisitedSiteId,
    saveLastVisitedSiteId,
    getSettings,
    saveSettings,
    onChange,
  };
})();
