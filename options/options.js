/**
 * options.js - Settings page logic
 *
 * Manages the settings form: language, open behavior, default site,
 * and the pinned sites list with add / remove actions.
 *
 * Depends on: lib/storage.js, lib/i18n.js, components/pin-manager.js
 */
(async function () {
  "use strict";

  // ---- Initialise i18n and theme first ----
  await I18n.init();
  await Theme.init();
  I18n.applyToDocument();

  // ---- DOM refs ----
  const langRadios        = document.querySelectorAll('input[name="language"]');
  const themeRadios       = document.querySelectorAll('input[name="theme"]');
  const behaviorRadios    = document.querySelectorAll('input[name="openBehavior"]');
  const defaultSitePicker = document.getElementById("default-site-picker");
  const defaultSiteSelect = document.getElementById("default-site-select");
  const pinnedSitesList   = document.getElementById("pinned-sites-list");
  const statusMessage     = document.getElementById("status-message");
  const urlInput          = document.getElementById("url-input");
  const addBtn            = document.getElementById("add-btn");
  const errorMsg          = document.getElementById("error-msg");

  // ---- Load current settings ----
  let settings = await Storage.getSettings();
  let sites    = await Storage.getPinnedSites();

  // Language radios
  langRadios.forEach((r) => { r.checked = r.value === (settings.language || "en"); });

  // Theme radios
  themeRadios.forEach((r) => { r.checked = r.value === (settings.theme || "auto"); });

  // Behavior radios
  behaviorRadios.forEach((r) => { r.checked = r.value === settings.openBehavior; });
  toggleDefaultPicker(settings.openBehavior);
  populateDefaultSiteDropdown(sites, settings.defaultSiteId);
  renderPinnedSitesList(sites);

  // ---- Language change ----
  langRadios.forEach((radio) => {
    radio.addEventListener("change", async (e) => {
      await Storage.saveSettings({ language: e.target.value });
      location.reload();
    });
  });

  // ---- Theme change ----
  themeRadios.forEach((radio) => {
    radio.addEventListener("change", async (e) => {
      await Storage.saveSettings({ theme: e.target.value });
      Theme.apply(e.target.value); // instant preview without reload
      showStatus(I18n.t("optionsSavedSettings"));
    });
  });

  // ---- Behavior change ----
  behaviorRadios.forEach((radio) => {
    radio.addEventListener("change", async (e) => {
      await Storage.saveSettings({ openBehavior: e.target.value });
      toggleDefaultPicker(e.target.value);
      showStatus(I18n.t("optionsSavedSettings"));
    });
  });

  defaultSiteSelect.addEventListener("change", async (e) => {
    await Storage.saveSettings({ defaultSiteId: e.target.value || null });
    showStatus(I18n.t("optionsSavedSettings"));
  });

  // ---- Add site ----
  async function addSite() {
    const raw = urlInput.value.trim();
    if (!raw) return;

    try {
      const site = await PinManager.addSite(raw);
      if (!site) {
        showError(I18n.t("optionsErrorAlreadyPinned"));
        return;
      }
      urlInput.value = "";
      hideError();
      sites = await Storage.getPinnedSites();
      populateDefaultSiteDropdown(sites, settings.defaultSiteId);
      renderPinnedSitesList(sites);
      showStatus(I18n.t("optionsSiteAdded"));
    } catch {
      showError(I18n.t("optionsErrorInvalidUrl"));
    }
  }

  addBtn.addEventListener("click", addSite);
  urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addSite(); });

  // Listen for storage changes from popup or other pages
  Storage.onChange(async (changes) => {
    if (changes.pinnedSites) {
      sites = changes.pinnedSites.newValue || [];
      populateDefaultSiteDropdown(sites, settings.defaultSiteId);
      renderPinnedSitesList(sites);
    }
    if (changes.settings) {
      settings = { ...settings, ...(changes.settings.newValue || {}) };
    }
  });

  // ---- Helpers ----

  function toggleDefaultPicker(behavior) {
    defaultSitePicker.style.display = behavior === "default" ? "block" : "none";
  }

  function populateDefaultSiteDropdown(sitesList, selectedId) {
    defaultSiteSelect.innerHTML = `<option value="">${I18n.t("optionsDefaultSitePlaceholder")}</option>`;
    sitesList.forEach((site) => {
      const opt = document.createElement("option");
      opt.value = site.id;
      opt.textContent = site.title || site.url;
      if (site.id === selectedId) opt.selected = true;
      defaultSiteSelect.appendChild(opt);
    });
  }

  function renderPinnedSitesList(sitesList) {
    pinnedSitesList.innerHTML = "";

    if (sitesList.length === 0) {
      const hint = document.createElement("p");
      hint.className = "options-hint";
      hint.textContent = I18n.t("optionsNoPins");
      pinnedSitesList.appendChild(hint);
      return;
    }

    sitesList.forEach((site) => {
      const item = document.createElement("div");
      item.className = "pinned-site-item";

      const img = document.createElement("img");
      img.src = site.favicon || "";
      img.alt = "";
      img.onerror = () => (img.style.display = "none");

      const info = document.createElement("div");
      info.className = "pinned-site-info";

      const title = document.createElement("span");
      title.className = "pinned-site-item-title";
      title.textContent = site.title || site.url;

      const url = document.createElement("span");
      url.className = "pinned-site-item-url";
      url.textContent = site.url;

      info.appendChild(title);
      info.appendChild(url);

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = I18n.t("optionsRemoveBtn");
      removeBtn.addEventListener("click", async () => {
        await PinManager.removeSite(site.id);
        sites = await Storage.getPinnedSites();
        populateDefaultSiteDropdown(sites, settings.defaultSiteId);
        renderPinnedSitesList(sites);
        showStatus(I18n.t("optionsSiteRemoved"));
      });

      item.appendChild(img);
      item.appendChild(info);
      item.appendChild(removeBtn);
      pinnedSitesList.appendChild(item);
    });
  }

  function showStatus(msg) {
    statusMessage.textContent = msg;
    statusMessage.style.display = "block";
    setTimeout(() => { statusMessage.style.display = "none"; }, 2000);
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  function hideError() {
    errorMsg.style.display = "none";
  }
})();
