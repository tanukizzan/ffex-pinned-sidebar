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
  applyI18n();

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
  async function addSite() {
    const raw = urlInput.value.trim();
    if (!raw) return;

    try {
      const site = await PinManager.addSite(raw);
      if (!site) {
        showError(I18n.t("popupErrorAlreadyPinned"));
        return;
      }
      urlInput.value = "";
      hideError();
      await render();
    } catch {
      showError(I18n.t("popupErrorInvalidUrl"));
    }
  }

  addBtn.addEventListener("click", addSite);
  urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addSite(); });

  // ---- Settings ----
  openOptionsBtn.addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  // ---- Helpers ----

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = I18n.t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = I18n.t(el.dataset.i18nTitle);
    });
    const urlEl = document.getElementById("url-input");
    if (urlEl) urlEl.placeholder = I18n.t("popupAddPlaceholder");
    document.documentElement.lang = I18n.getLanguage();
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  function hideError() {
    errorMsg.style.display = "none";
  }
})();
