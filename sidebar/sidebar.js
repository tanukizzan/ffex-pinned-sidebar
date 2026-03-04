/**
 * sidebar.js - Sidebar panel controller (redirect architecture)
 *
 * On load: registers this tab with background (for tab ID tracking), then asks
 * background for the currently active site and navigates to it.
 *
 * If the sidebar opens with no pins yet (empty-state placeholder), it stays on
 * sidebar.html and listens for a "navigateSidebar" message from background.
 * The popup sends this message after the first pin is added so the sidebar
 * immediately shows the new site without requiring a manual reopen.
 *
 * Depends on: lib/storage.js, lib/i18n.js, lib/theme.js
 */
(async function main() {
  "use strict";

  await I18n.init();
  await Theme.init();

  // Register this tab with background so it can forward navigate commands.
  await browser.runtime.sendMessage({ type: "registerSidebarTab" });

  const response = await browser.runtime.sendMessage({ type: "getActiveSite" });

  if (response && response.url) {
    window.location.replace(response.url);
  } else {
    // No pins yet — show placeholder using DOM API (avoids innerHTML).
    document.documentElement.lang = I18n.getLanguage();

    const p1 = document.createElement("p");
    p1.textContent = I18n.t("sidebarNoPins");

    const br = document.createElement("br");

    const p2 = document.createElement("p");
    p2.textContent = I18n.t("sidebarNoPinsHint");

    const container = document.createElement("div");
    container.className = "sidebar-placeholder";
    container.appendChild(p1);
    container.appendChild(br);
    container.appendChild(p2);

    document.body.appendChild(container);

    // Listen for the popup telling us to navigate once the first site is added.
    browser.runtime.onMessage.addListener(function onNavigate(message) {
      if (message.type === "navigateSidebar" && message.url) {
        browser.runtime.onMessage.removeListener(onNavigate);
        window.location.replace(message.url);
      }
    });
  }
})();
