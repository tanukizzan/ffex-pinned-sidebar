/**
 * pin-bar.js - Top-fixed pinned sites icon bar
 *
 * Renders favicon icons for each pinned site. Handles:
 *   - Click to switch site
 *   - Right-click context menu (delete)
 *   - "+" button to add a new site
 *   - Drag-and-drop reorder
 *
 * Depends on: components/pin-manager.js, lib/storage.js
 */
const PinBar = (() => {
  let barEl = null;
  let onSelectCallback = null;
  let activeSiteId = null;

  /**
   * Initialise the pin bar inside a container.
   */
  function init(containerSelector) {
    barEl = document.querySelector(containerSelector);
    if (!barEl) {
      console.error("PinBar: container not found:", containerSelector);
      return;
    }
    barEl.addEventListener("contextmenu", handleContextMenu);
  }

  /**
   * Render the icon bar from the current pinned sites list.
   */
  async function render() {
    if (!barEl) return;

    const sites = await PinManager.getSites();
    // Clear existing icons (keep the add button)
    barEl.innerHTML = "";

    sites.forEach((site, index) => {
      const btn = document.createElement("button");
      btn.className = "pin-bar-icon" + (site.id === activeSiteId ? " active" : "");
      btn.dataset.siteId = site.id;
      btn.dataset.index = index;
      btn.title = site.title || site.url;
      btn.draggable = true;

      const img = document.createElement("img");
      img.src = site.favicon || "";
      img.alt = site.title || "";
      img.width = 20;
      img.height = 20;
      img.onerror = () => {
        // Fallback: show first letter
        img.style.display = "none";
        const fallback = document.createElement("span");
        fallback.className = "pin-bar-icon-fallback";
        fallback.textContent = (site.title || "?")[0].toUpperCase();
        btn.insertBefore(fallback, btn.firstChild);
      };

      btn.appendChild(img);

      btn.addEventListener("click", () => {
        setActive(site.id);
        if (onSelectCallback) onSelectCallback(site);
      });

      // Drag events
      btn.addEventListener("dragstart", handleDragStart);
      btn.addEventListener("dragover", handleDragOver);
      btn.addEventListener("drop", handleDrop);
      btn.addEventListener("dragend", handleDragEnd);

      barEl.appendChild(btn);
    });

    // Add "+" button
    const addBtn = document.createElement("button");
    addBtn.className = "pin-bar-add";
    addBtn.title = "Add a site";
    addBtn.textContent = "+";
    addBtn.addEventListener("click", handleAddClick);
    barEl.appendChild(addBtn);
  }

  /**
   * Set which icon is visually active.
   */
  function setActive(siteId) {
    activeSiteId = siteId;
    if (!barEl) return;
    barEl.querySelectorAll(".pin-bar-icon").forEach((el) => {
      el.classList.toggle("active", el.dataset.siteId === siteId);
    });
  }

  /**
   * Register a callback when a site icon is clicked.
   */
  function onSelect(callback) {
    onSelectCallback = callback;
  }

  // ---- Add site ----

  async function handleAddClick() {
    const url = prompt("Enter the URL to pin:", "https://");
    if (!url || url === "https://") return;

    try {
      const site = await PinManager.addSite(url);
      if (site) {
        await render();
        setActive(site.id);
        if (onSelectCallback) onSelectCallback(site);
      } else {
        alert("This site is already pinned.");
      }
    } catch (e) {
      alert("Invalid URL: " + e.message);
    }
  }

  // ---- Context menu (right-click to delete) ----

  function handleContextMenu(e) {
    const btn = e.target.closest(".pin-bar-icon");
    if (!btn) return;
    e.preventDefault();

    const siteId = btn.dataset.siteId;
    showContextMenu(e.clientX, e.clientY, siteId);
  }

  function showContextMenu(x, y, siteId) {
    removeContextMenu();

    const menu = document.createElement("div");
    menu.className = "pin-bar-context-menu";
    menu.style.left = x + "px";
    menu.style.top = y + "px";

    const removeItem = document.createElement("button");
    removeItem.className = "pin-bar-context-menu-item";
    removeItem.textContent = "Remove";
    removeItem.addEventListener("click", async () => {
      await PinManager.removeSite(siteId);
      removeContextMenu();
      await render();
      // If the removed site was active, clear the viewer
      if (activeSiteId === siteId) {
        activeSiteId = null;
        if (onSelectCallback) onSelectCallback(null);
      }
    });

    menu.appendChild(removeItem);
    document.body.appendChild(menu);

    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", removeContextMenu, { once: true });
    }, 0);
  }

  function removeContextMenu() {
    const existing = document.querySelector(".pin-bar-context-menu");
    if (existing) existing.remove();
  }

  // ---- Drag and drop reorder ----

  let dragSourceIndex = null;

  function handleDragStart(e) {
    dragSourceIndex = parseInt(e.currentTarget.dataset.index, 10);
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const target = e.currentTarget;
    target.classList.add("drag-over");
  }

  function handleDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove("drag-over");

    const toIndex = parseInt(target.dataset.index, 10);
    if (dragSourceIndex !== null && dragSourceIndex !== toIndex) {
      PinManager.moveSite(dragSourceIndex, toIndex).then(() => render());
    }
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
    barEl.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
    dragSourceIndex = null;
  }

  return {
    init,
    render,
    setActive,
    onSelect,
  };
})();
