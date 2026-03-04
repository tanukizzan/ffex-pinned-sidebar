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
 * Depends on: lib/storage.js, lib/i18n.js
 */
(async function main() {
  "use strict";

  await I18n.init();

  // Register this tab with background so it can forward navigate commands.
  await browser.runtime.sendMessage({ type: "registerSidebarTab" });

  const response = await browser.runtime.sendMessage({ type: "getActiveSite" });

  if (response && response.url) {
    window.location.replace(response.url);
  } else {
    // No pins yet — show placeholder and wait for the first pin to be added.
    document.body.innerHTML =
      `<p style="font-family:sans-serif;padding:16px;color:#888;">` +
      `${I18n.t("sidebarNoPins")}<br>${I18n.t("sidebarNoPinsHint")}</p>`;

    // Listen for the popup telling us to navigate once the first site is added.
    browser.runtime.onMessage.addListener(function onNavigate(message) {
      if (message.type === "navigateSidebar" && message.url) {
        browser.runtime.onMessage.removeListener(onNavigate);
        window.location.replace(message.url);
      }
    });
  }
})();
