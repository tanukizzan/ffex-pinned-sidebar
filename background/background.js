/**
 * background.js - Background Event Page
 *
 * Responsibilities:
 *   1. Track which site is currently active in the sidebar (in-memory).
 *   2. Handle messages from popup and sidebar:
 *      - "getActiveSite"      → return the current active site object
 *      - "setActiveSite"      → update active site
 *      - "registerSidebarTab" → remember the sidebar's tab ID
 *      - "navigateSidebar"    → forward a navigate command to the sidebar tab
 *   3. Initialise default storage on first install.
 *
 * Architecture note:
 *   The sidebar panel redirects itself to the target site URL using
 *   window.location.replace(), so no iframe / webRequest header manipulation
 *   is needed.  Sites open natively in the sidebar panel, just like any
 *   normal tab — bypassing X-Frame-Options and CSP restrictions entirely.
 */
"use strict";

// ============================================================
// Active site state (in-memory; reset when background wakes)
// ============================================================

let _activeSite = null; // { id, url, title, favicon } | null

// Set of tab IDs that belong to the sidebar panel.
// Updated each time sidebar.html loads and sends "registerSidebarTab".
const _sidebarTabIds = new Set();

// Clean up tab IDs when a tab closes.
browser.tabs.onRemoved.addListener((tabId) => {
  _sidebarTabIds.delete(tabId);
});

// Restore active site from storage when background wakes
async function restoreActiveSite() {
  const lastId = await browser.storage.local
    .get("lastVisitedSiteId")
    .then((r) => r.lastVisitedSiteId || null);

  if (!lastId) return;

  const { pinnedSites = [] } = await browser.storage.local.get("pinnedSites");
  _activeSite = pinnedSites.find((s) => s.id === lastId) || null;
}

restoreActiveSite();

// ============================================================
// Message handling
// ============================================================

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    // ---- Popup / sidebar asks: which site is active? ----
    case "getActiveSite": {
      if (_activeSite) {
        sendResponse(_activeSite);
        return false;
      }

      // Fall back to settings-based selection
      browser.storage.local
        .get(["pinnedSites", "lastVisitedSiteId", "settings"])
        .then(({ pinnedSites = [], lastVisitedSiteId, settings = {} }) => {
          let site = null;

          if (settings.openBehavior === "default" && settings.defaultSiteId) {
            site = pinnedSites.find((s) => s.id === settings.defaultSiteId) || null;
          }

          if (!site && lastVisitedSiteId) {
            site = pinnedSites.find((s) => s.id === lastVisitedSiteId) || null;
          }

          if (!site && pinnedSites.length > 0) {
            site = pinnedSites[0];
          }

          _activeSite = site;
          sendResponse(site);
        });
      return true; // async
    }

    // ---- Popup says: switch to this site ----
    case "setActiveSite": {
      browser.storage.local.get("pinnedSites").then(async ({ pinnedSites = [] }) => {
        const site = pinnedSites.find((s) => s.id === message.siteId) || null;
        _activeSite = site;

        if (site) {
          // Persist as last visited
          await browser.storage.local.set({ lastVisitedSiteId: site.id });
        }

        sendResponse({ ok: true });
      });
      return true; // async
    }

    // ---- Sidebar registers its tab ID ----
    case "registerSidebarTab": {
      if (sender.tab) {
        _sidebarTabIds.add(sender.tab.id);
      }
      sendResponse({ ok: true });
      return false;
    }

    // ---- Popup asks sidebar to navigate (first pin added while sidebar was
    //      showing the empty-state placeholder) ----
    case "navigateSidebar": {
      for (const tabId of _sidebarTabIds) {
        browser.tabs.sendMessage(tabId, {
          type: "navigateSidebar",
          url: message.url,
        }).catch(() => {
          _sidebarTabIds.delete(tabId);
        });
      }
      sendResponse({ ok: true });
      return false;
    }

    default:
      return false;
  }
});

// ============================================================
// Toolbar button: toggle the sidebar
// ============================================================

browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

// ============================================================
// Install / Update
// ============================================================

browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await browser.storage.local.set({
      pinnedSites: [],
      lastVisitedSiteId: null,
      settings: {
        openBehavior: "lastVisited",
        defaultSiteId: null,
      },
    });
    console.log("Pinned Sidebar: installed with default settings.");
  }
});
