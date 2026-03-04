/**
 * popup.js - Toolbar popup controller
 *
 * Shows pinned sites list; clicking a site tells background to switch
 * the sidebar to that URL. Also handles add/remove pins.
 *
 * Depends on: lib/storage.js, lib/i18n.js, components/pin-manager.js
 */
(async function main() {
  "use strict";

  // ---- Initialise i18n and theme first ----
  await I18n.init();
  await Theme.init();
  I18n.applyToDocument();

  // ---- DOM refs ----
  const siteList      = document.getElementById("site-list");
  const emptyState    = document.getElementById("empty-state");
  const urlInput      = document.getElementById("url-input");
  const addBtn        = document.getElementById("add-btn");
  const errorMsg      = document.getElementById("error-msg");
  const openOptionsBtn = document.getElementById("open-options");

  // ---- Fetch current active site from background ----
  let activeSiteId = null;
  try {
    const state = await browser.runtime.sendMessage({ type: "getActiveSite" });
    activeSiteId = state ? state.id : null;
  } catch (_) {
    // background may not be ready yet; ignore
  }

  // ---- Render ----
  async function render() {
    const sites = await PinManager.getSites();
    siteList.innerHTML = "";

    if (sites.length === 0) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    for (const site of sites) {
      const li = document.createElement("li");
      li.className = "site-item" + (site.id === activeSiteId ? " active" : "");
      li.dataset.id = site.id;

      const img = document.createElement("img");
      img.className = "favicon";
      img.src = site.favicon || "";
      img.alt = "";
      img.onerror = () => (img.style.display = "none");

      const title = document.createElement("span");
      title.className = "site-title";
      title.textContent = site.title || site.url;
      title.title = site.url;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "\u00D7"; // ×
      removeBtn.title = I18n.t("popupRemoveTitle");
      removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await PinManager.removeSite(site.id);
        if (activeSiteId === site.id) {
          activeSiteId = null;
          await browser.runtime.sendMessage({ type: "setActiveSite", siteId: null });
        }
        await render();
      });

      li.appendChild(img);
      li.appendChild(title);
      li.appendChild(removeBtn);

      li.addEventListener("click", async () => {
        activeSiteId = site.id;
        browser.sidebarAction.open();
        await browser.runtime.sendMessage({ type: "setActiveSite", siteId: site.id });
        window.close();
      });

      siteList.appendChild(li);
    }
  }

  await render();

  // ---- Add site ----
  //
  // When the sidebar is on the empty-state placeholder (no pins), we must call
  // sidebarAction.open() synchronously inside the user-action context, before
  // any await.  emptyState.style.display tells us the current state without
  // needing an async round-trip to storage, because render() already set it.

  function onAddClick() {
    const raw = urlInput.value.trim();
    if (!raw) return;

    // Sidebar was showing the placeholder ⟹ open it now, while we are still
    // in the synchronous user-action context.
    const sidebarWasEmpty = emptyState.style.display !== "none";
    if (sidebarWasEmpty) {
      browser.sidebarAction.open();
    }

    // Continue asynchronously.
    addSiteAsync(raw, sidebarWasEmpty);
  }

  async function addSiteAsync(raw, sidebarWasEmpty) {
    try {
      const site = await PinManager.addSite(raw);
      if (!site) {
        showError(I18n.t("popupErrorAlreadyPinned"));
        return;
      }
      urlInput.value = "";
      hideError();
      await render();

      if (sidebarWasEmpty && site) {
        // Tell the background which site is now active, then ask it to forward
        // a navigate command to the sidebar panel (which is still showing the
        // empty-state placeholder because location.replace() was never called).
        await browser.runtime.sendMessage({ type: "setActiveSite", siteId: site.id });
        browser.runtime.sendMessage({ type: "navigateSidebar", url: site.url });
        window.close();
      }
    } catch {
      showError(I18n.t("popupErrorInvalidUrl"));
    }
  }

  addBtn.addEventListener("click", onAddClick);
  urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") onAddClick(); });

  // ---- Settings ----
  openOptionsBtn.addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  // ---- Helpers ----

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  function hideError() {
    errorMsg.style.display = "none";
  }
})();
