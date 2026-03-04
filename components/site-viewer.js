/**
 * site-viewer.js - iframe-based site viewer
 *
 * Manages the <iframe> element that displays pinned sites.
 * Depends on: lib/storage.js
 */
const SiteViewer = (() => {
  let iframeEl = null;
  let currentSiteId = null;
  let onNavigateCallback = null;

  /**
   * Initialise the viewer with a container element.
   */
  function init(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error("SiteViewer: container not found:", containerSelector);
      return;
    }

    iframeEl = document.createElement("iframe");
    iframeEl.id = "site-viewer-frame";
    // NOTE: No `sandbox` attribute here.
    // The sandbox attribute imposes additional browser-level restrictions
    // that can cause Firefox to block sites even after X-Frame-Options and
    // CSP headers are stripped by the background webRequest listener.
    // Sites are already sandboxed by their own origin; we rely on the
    // header-stripping in background.js to control embedding permissions.
    iframeEl.src = "about:blank";
    container.appendChild(iframeEl);
  }

  /**
   * Load a site by its pinned-site object.
   */
  function loadSite(site) {
    if (!iframeEl) return;
    if (!site || !site.url) {
      iframeEl.src = "about:blank";
      currentSiteId = null;
      return;
    }

    currentSiteId = site.id;
    iframeEl.src = site.url;

    // Persist as last visited
    Storage.saveLastVisitedSiteId(site.id);

    if (onNavigateCallback) {
      onNavigateCallback(site);
    }
  }

  /**
   * Get the currently displayed site ID.
   */
  function getCurrentSiteId() {
    return currentSiteId;
  }

  /**
   * Register a callback when the viewer navigates to a new site.
   */
  function onNavigate(callback) {
    onNavigateCallback = callback;
  }

  /**
   * Show an empty state message when no sites are pinned.
   */
  function showEmptyState(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Remove iframe temporarily
    if (iframeEl) {
      iframeEl.style.display = "none";
    }

    let emptyEl = container.querySelector(".empty-state");
    if (!emptyEl) {
      emptyEl = document.createElement("div");
      emptyEl.className = "empty-state";
      emptyEl.innerHTML = `
        <div class="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="17" r="7" stroke="#999" stroke-width="2" fill="none"/>
            <line x1="24" y1="24" x2="24" y2="39" stroke="#999" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-state-text">No pinned sites yet</p>
        <p class="empty-state-hint">Click the <strong>+</strong> button above to add a site</p>
      `;
      container.appendChild(emptyEl);
    }
    emptyEl.style.display = "flex";
  }

  /**
   * Hide the empty state and show the iframe.
   */
  function hideEmptyState(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const emptyEl = container.querySelector(".empty-state");
    if (emptyEl) {
      emptyEl.style.display = "none";
    }
    if (iframeEl) {
      iframeEl.style.display = "block";
    }
  }

  return {
    init,
    loadSite,
    getCurrentSiteId,
    onNavigate,
    showEmptyState,
    hideEmptyState,
  };
})();
