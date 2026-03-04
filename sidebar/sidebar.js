/**
 * sidebar.js - Sidebar panel controller (redirect architecture)
 *
 * On load: asks background for the currently active site and navigates to it.
 * Site switching is handled by background reopening the sidebar (close + open),
 * which causes this script to run again with the newly saved active site.
 *
 * Depends on: lib/storage.js, lib/i18n.js
 */
(async function main() {
  "use strict";

  await I18n.init();

  const response = await browser.runtime.sendMessage({ type: "getActiveSite" });

  if (response && response.url) {
    window.location.replace(response.url);
  } else {
    document.body.innerHTML =
      `<p style="font-family:sans-serif;padding:16px;color:#888;">` +
      `${I18n.t("sidebarNoPins")}<br>${I18n.t("sidebarNoPinsHint")}</p>`;
  }
})();
