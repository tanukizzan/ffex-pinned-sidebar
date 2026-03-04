/**
 * pin-manager.js - Pinned sites CRUD operations
 *
 * Business logic for adding, removing, reordering pinned sites.
 * Depends on: lib/storage.js
 */
const PinManager = (() => {
  /**
   * Generate a simple unique ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * Build a favicon URL using Google's favicon service
   */
  function buildFaviconUrl(siteUrl) {
    try {
      const url = new URL(siteUrl);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch {
      return null;
    }
  }

  /**
   * Extract a display title from a URL
   */
  function extractTitle(siteUrl) {
    try {
      const url = new URL(siteUrl);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return siteUrl;
    }
  }

  /**
   * Normalise user input into a proper URL string
   */
  function normalizeUrl(input) {
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    // Validate
    new URL(url); // throws if invalid
    return url;
  }

  // ---- CRUD operations ----

  /**
   * Add a new pinned site.  Returns the created site object.
   */
  async function addSite(rawUrl) {
    const url = normalizeUrl(rawUrl);
    const sites = await Storage.getPinnedSites();

    // Prevent duplicates
    if (sites.some((s) => s.url === url)) {
      return null;
    }

    const site = {
      id: generateId(),
      url,
      title: extractTitle(url),
      favicon: buildFaviconUrl(url),
    };
    sites.push(site);
    await Storage.savePinnedSites(sites);
    return site;
  }

  /**
   * Remove a pinned site by ID.
   */
  async function removeSite(id) {
    let sites = await Storage.getPinnedSites();
    sites = sites.filter((s) => s.id !== id);
    await Storage.savePinnedSites(sites);
  }

  /**
   * Move a site from one index to another (for drag-and-drop reorder).
   */
  async function moveSite(fromIndex, toIndex) {
    const sites = await Storage.getPinnedSites();
    if (fromIndex < 0 || fromIndex >= sites.length) return;
    if (toIndex < 0 || toIndex >= sites.length) return;
    const [moved] = sites.splice(fromIndex, 1);
    sites.splice(toIndex, 0, moved);
    await Storage.savePinnedSites(sites);
  }

  /**
   * Get all pinned sites.
   */
  async function getSites() {
    return Storage.getPinnedSites();
  }

  /**
   * Find a site by ID.
   */
  async function getSiteById(id) {
    const sites = await Storage.getPinnedSites();
    return sites.find((s) => s.id === id) || null;
  }

  /**
   * Update a site's properties (e.g. title, url).
   */
  async function updateSite(id, updates) {
    const sites = await Storage.getPinnedSites();
    const index = sites.findIndex((s) => s.id === id);
    if (index === -1) return null;

    if (updates.url) {
      updates.url = normalizeUrl(updates.url);
      updates.favicon = buildFaviconUrl(updates.url);
      if (!updates.title) {
        updates.title = extractTitle(updates.url);
      }
    }

    sites[index] = { ...sites[index], ...updates };
    await Storage.savePinnedSites(sites);
    return sites[index];
  }

  // ---- public API ----
  return {
    addSite,
    removeSite,
    moveSite,
    getSites,
    getSiteById,
    updateSite,
    normalizeUrl,
    buildFaviconUrl,
  };
})();
