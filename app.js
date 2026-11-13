/**
 * RKdash - Google Apps Script & Subdomain Application Portal
 * Core Client Application Logic
 */

// Default Seed Applications
const DEFAULT_APPS = [
  {
    id: "app-1",
    title: "Invoice & Billing Automator",
    subdomain: "billing.rkdash.internal",
    url: "https://script.google.com/macros/s/AKfycbxExampleInvoiceApp/exec",
    category: "Finance",
    description: "Automated GST/VAT invoice generation from Google Sheets with one-click PDF email delivery.",
    icon: "💳",
    tags: ["sheets", "finance", "pdf"],
    status: "active",
    pinned: true,
    allowPreview: true,
    createdAt: 1700000000000
  },
  {
    id: "app-2",
    title: "Employee Leave & Attendance Portal",
    subdomain: "leave.rkdash.internal",
    url: "https://script.google.com/macros/s/AKfycbxLeavePortalExample/exec",
    category: "HR & Operations",
    description: "Staff leave applications, supervisor approval matrix, and annual quota calculation engine.",
    icon: "🌴",
    tags: ["hr", "approval", "workflow"],
    status: "active",
    pinned: true,
    allowPreview: true,
    createdAt: 1700000100000
  },
  {
    id: "app-3",
    title: "Inventory & Barcode Scanner Hub",
    subdomain: "inventory.rkdash.internal",
    url: "https://script.google.com/macros/s/AKfycbxInventoryBarcodeScanner/exec",
    category: "Operations",
    description: "Real-time stock tracking with mobile camera barcode scanner and low-stock automated alerts.",
    icon: "📦",
    tags: ["warehouse", "qr-code", "mobile"],
    status: "beta",
    pinned: false,
    allowPreview: true,
    createdAt: 1700000200000
  },
  {
    id: "app-4",
    title: "Bulk Mail Merge & Campaign Engine",
    subdomain: "mailmerge.rkdash.internal",
    url: "https://script.google.com/macros/s/AKfycbxBulkMailerApp/exec",
    category: "Automation",
    description: "Personalized mass email dispatch using Gmail API with read tracking & bounce logging.",
    icon: "✉️",
    tags: ["gmail", "email", "marketing"],
    status: "active",
    pinned: false,
    allowPreview: false,
    createdAt: 1700000300000
  },
  {
    id: "app-5",
    title: "Google Forms to CRM Lead Router",
    subdomain: "crm-sync.rkdash.internal",
    url: "https://script.google.com/macros/s/AKfycbxFormSyncApp/exec",
    category: "Automation",
    description: "Webhooks ingestion from customer intake forms into centralized CRM with WhatsApp notifications.",
    icon: "⚡",
    tags: ["webhook", "crm", "forms"],
    status: "active",
    pinned: false,
    allowPreview: true,
    createdAt: 1700000400000
  },
  {
    id: "app-6",
    title: "Executive KPI & Analytics Dashboard",
    subdomain: "kpi.rkdash.internal",
    url: "https://script.google.com/macros/s/AKfycbxExecutiveReportApp/exec",
    category: "Reporting",
    description: "Consolidated monthly performance charts, revenue projections, and department metrics.",
    icon: "📊",
    tags: ["analytics", "charts", "management"],
    status: "maintenance",
    pinned: false,
    allowPreview: true,
    createdAt: 1700000500000
  }
];

// App State
const state = {
  apps: [],
  isAdmin: false,
  adminPin: "admin123",
  searchQuery: "",
  activeCategory: "All",
  activeTag: null,
  sortMode: "custom",
  viewMode: "grid", // "grid" | "list"
  gasEndpoint: ""
};

// Storage Keys
const STORAGE_KEYS = {
  APPS: "rkdash_apps_v1",
  ADMIN_PIN: "rkdash_admin_pin",
  THEME: "rkdash_theme",
  VIEW_MODE: "rkdash_view_mode",
  GAS_ENDPOINT: "rkdash_gas_endpoint"
};

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  loadSavedPreferences();
  loadApps();
  setupEventListeners();
  renderCategories();
  renderApps();
  updateMetrics();
  refreshIcons();
});

// Load preferences from localStorage
function loadSavedPreferences() {
  // Theme setup
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // View Mode
  const savedView = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
  if (savedView === "list" || savedView === "grid") {
    state.viewMode = savedView;
    applyViewModeUI();
  }

  // Admin PIN
  const savedPin = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
  if (savedPin) state.adminPin = savedPin;

  // GAS Endpoint
  const savedEndpoint = localStorage.getItem(STORAGE_KEYS.GAS_ENDPOINT);
  if (savedEndpoint) {
    state.gasEndpoint = savedEndpoint;
    const input = document.getElementById("gasApiEndpointInput");
    if (input) input.value = savedEndpoint;
  }
}

// Load applications from localStorage or seed
function loadApps() {
  const stored = localStorage.getItem(STORAGE_KEYS.APPS);
  if (stored) {
    try {
      state.apps = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored apps, reverting to default.", e);
      state.apps = [...DEFAULT_APPS];
      saveApps();
    }
  } else {
    state.apps = [...DEFAULT_APPS];
    saveApps();
  }
}

// Persist applications to localStorage
function saveApps() {
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(state.apps));
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Theme Toggle
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? "dark" : "light");
    refreshIcons();
  });

  // Admin Mode Toggle
  const adminToggleBtn = document.getElementById("adminToggleBtn");
  adminToggleBtn.addEventListener("click", () => {
    if (state.isAdmin) {
      exitAdminMode();
    } else {
      openAdminPinModal();
    }
  });

  const exitAdminBtn = document.getElementById("exitAdminBtn");
  if (exitAdminBtn) {
    exitAdminBtn.addEventListener("click", exitAdminMode);
  }

  // Admin PIN Modal
  document.getElementById("closeAdminPinModal").addEventListener("click", closeAdminPinModal);
  document.getElementById("submitAdminPinBtn").addEventListener("click", handlePinSubmit);
  document.getElementById("adminPinInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlePinSubmit();
  });

  // Quick Add App Button
  const quickAddAppBtn = document.getElementById("quickAddAppBtn");
  quickAddAppBtn.addEventListener("click", () => {
    if (!state.isAdmin) {
      showToast("Unlocking Admin Mode is required to add apps.", "info");
      openAdminPinModal(() => openAppFormModal());
    } else {
      openAppFormModal();
    }
  });

  // App Form Modal
  document.getElementById("closeAppFormModal").addEventListener("click", closeAppFormModal);
  document.getElementById("cancelAppFormBtn").addEventListener("click", closeAppFormModal);
  document.getElementById("appForm").addEventListener("submit", handleAppFormSubmit);

  // Icon Preset Buttons in Form
  document.querySelectorAll(".icon-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("formAppIcon").value = btn.dataset.icon;
    });
  });

  // Search Inputs (Desktop and Mobile)
  const searchInput = document.getElementById("searchInput");
  const mobileSearchInput = document.getElementById("mobileSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  const handleSearch = (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    if (clearSearchBtn) {
      clearSearchBtn.classList.toggle("hidden", !state.searchQuery);
    }
    renderApps();
  };

  searchInput.addEventListener("input", handleSearch);
  mobileSearchInput.addEventListener("input", handleSearch);

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    mobileSearchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.classList.add("hidden");
    renderApps();
  });

  // Keyboard shortcut '/' to search
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Reset Search / Filters Button
  document.getElementById("resetSearchBtn").addEventListener("click", () => {
    state.searchQuery = "";
    state.activeCategory = "All";
    state.activeTag = null;
    searchInput.value = "";
    mobileSearchInput.value = "";
    clearSearchBtn.classList.add("hidden");
    renderCategories();
    renderApps();
  });

  // Tag filter remover
  document.getElementById("removeTagFilterBtn").addEventListener("click", () => {
    state.activeTag = null;
    document.getElementById("activeTagContainer").classList.add("hidden");
    document.getElementById("activeTagContainer").classList.remove("flex");
    renderApps();
  });

  // Sort Selector
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sortMode = e.target.value;
    renderApps();
  });

  // View Mode Buttons
  const viewGridBtn = document.getElementById("viewGridBtn");
  const viewListBtn = document.getElementById("viewListBtn");

  viewGridBtn.addEventListener("click", () => {
    state.viewMode = "grid";
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, "grid");
    applyViewModeUI();
  });

  viewListBtn.addEventListener("click", () => {
    state.viewMode = "list";
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, "list");
    applyViewModeUI();
  });

  // Preview Modal
  document.getElementById("closePreviewBtn").addEventListener("click", closePreviewModal);

  // Backup / JSON Modal
  document.getElementById("exportDataBtn").addEventListener("click", () => openBackupModal("export"));
  document.getElementById("importDataBtn").addEventListener("click", () => openBackupModal("import"));
  document.getElementById("closeBackupModal").addEventListener("click", closeBackupModal);
  document.getElementById("copyJsonBtn").addEventListener("click", copyBackupJson);
  document.getElementById("applyImportJsonBtn").addEventListener("click", applyImportedJson);

  // GAS Sync Modal
  document.getElementById("gasSyncModalBtn").addEventListener("click", openGasSyncModal);
  document.getElementById("closeGasSyncModal").addEventListener("click", closeGasSyncModal);
  document.getElementById("footerGasGuideBtn").addEventListener("click", openGasSyncModal);
  document.getElementById("saveGasEndpointBtn").addEventListener("click", handleSaveGasEndpoint);

  // Footer Reset Button
  document.getElementById("footerResetBtn").addEventListener("click", () => {
    if (confirm("Reset applications list back to initial sample apps?")) {
      state.apps = JSON.parse(JSON.stringify(DEFAULT_APPS));
      saveApps();
      renderCategories();
      renderApps();
      updateMetrics();
      showToast("Reset to sample applications data.", "info");
    }
  });
}

// ==================== RENDERING ====================

// Render Category Filter Pills
function renderCategories() {
  const container = document.getElementById("categoryPillList");
  if (!container) return;

  const categories = ["All", ...new Set(state.apps.map(a => a.category).filter(Boolean))];

  container.innerHTML = categories.map(cat => {
    const isSelected = state.activeCategory === cat;
    const baseClasses = "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer";
    const activeClasses = isSelected
      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

    return `<button class="category-pill ${baseClasses} ${activeClasses}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
  }).join("");

  // Attach click events
  container.querySelectorAll(".category-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeCategory = btn.dataset.category;
      renderCategories();
      renderApps();
    });
  });
}

// Render Application Cards
function renderApps() {
  const container = document.getElementById("appsContainer");
  const emptyState = document.getElementById("emptyState");
  if (!container) return;

  // Filter apps
  let filtered = state.apps.filter(app => {
    // Category match
    if (state.activeCategory !== "All" && app.category !== state.activeCategory) {
      return false;
    }
    // Tag match
    if (state.activeTag && (!app.tags || !app.tags.includes(state.activeTag))) {
      return false;
    }
    // Search query match
    if (state.searchQuery) {
      const q = state.searchQuery;
      const titleMatch = app.title && app.title.toLowerCase().includes(q);
      const subMatch = app.subdomain && app.subdomain.toLowerCase().includes(q);
      const urlMatch = app.url && app.url.toLowerCase().includes(q);
      const descMatch = app.description && app.description.toLowerCase().includes(q);
      const tagMatch = app.tags && app.tags.some(t => t.toLowerCase().includes(q));
      const catMatch = app.category && app.category.toLowerCase().includes(q);
      if (!titleMatch && !subMatch && !urlMatch && !descMatch && !tagMatch && !catMatch) {
        return false;
      }
    }
    return true;
  });

  // Sorting
  filtered = sortApps(filtered, state.sortMode);

  // Empty state handling
  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    emptyState.classList.add("flex");
    return;
  } else {
    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");
  }

  // Generate cards
  container.innerHTML = filtered.map(app => renderSingleCard(app)).join("");

  // Post-render attachments (Lucide icons and action listeners)
  attachCardActionListeners(container);
  refreshIcons();
}

// Render individual card HTML
function renderSingleCard(app) {
  const statusBadge = getStatusBadgeHtml(app.status);
  const iconDisplay = getAppIconHtml(app.icon);
  const tagsHtml = (app.tags || []).map(t => 
    `<span class="tag-pill text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 cursor-pointer" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</span>`
  ).join("");

  return `
    <div class="app-card relative bg-white dark:bg-darkCard border border-slate-200/90 dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:border-indigo-500/40 flex flex-col justify-between group" data-app-id="${app.id}">
      
      <!-- Top Card Row: Icon, Title, Subdomain, Pinned & Status -->
      <div>
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              ${iconDisplay}
            </div>
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white leading-tight">${escapeHtml(app.title)}</h3>
                ${app.pinned ? '<span title="Pinned Application" class="text-amber-500"><i data-lucide="pin" class="w-3.5 h-3.5 fill-amber-500"></i></span>' : ''}
              </div>
              ${app.subdomain ? `<p class="text-[11px] font-mono text-indigo-500 dark:text-indigo-400 font-medium">${escapeHtml(app.subdomain)}</p>` : `<p class="text-[11px] text-slate-400 font-medium">${escapeHtml(app.category || 'General')}</p>`}
            </div>
          </div>

          <!-- Status Badge -->
          <div class="shrink-0">
            ${statusBadge}
          </div>
        </div>

        <!-- Description -->
        <div class="app-card-body mt-3">
          <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            ${escapeHtml(app.description || 'No description provided for this application.')}
          </p>

          <!-- Tags list -->
          ${tagsHtml ? `<div class="flex flex-wrap gap-1.5 mt-3">${tagsHtml}</div>` : ''}
        </div>
      </div>

      <!-- Card Footer Actions -->
      <div class="app-card-footer mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        
        <!-- Left: Launch & Preview -->
        <div class="flex items-center gap-2">
          <a 
            href="${escapeHtml(app.url)}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all hover:gap-2"
          >
            <span>Launch</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>

          ${app.allowPreview ? `
            <button 
              class="card-preview-btn p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
              title="Preview inside RKdash"
              data-id="${app.id}"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}

          <button 
            class="card-copy-btn p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            title="Copy URL"
            data-url="${escapeHtml(app.url)}"
          >
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Right: Admin Edit/Delete Controls -->
        <div class="flex items-center gap-1 ${state.isAdmin ? '' : 'hidden'}">
          <button 
            class="card-edit-btn p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            title="Edit Application"
            data-id="${app.id}"
          >
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
          </button>
          <button 
            class="card-clone-btn p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            title="Duplicate Application"
            data-id="${app.id}"
          >
            <i data-lucide="copy-plus" class="w-3.5 h-3.5"></i>
          </button>
          <button 
            class="card-delete-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            title="Delete Application"
            data-id="${app.id}"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>

      </div>
    </div>
  `;
}

// Attach action listeners to card buttons
function attachCardActionListeners(container) {
  // Preview
  container.querySelectorAll(".card-preview-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const app = state.apps.find(a => a.id === btn.dataset.id);
      if (app) openPreviewModal(app);
    });
  });

  // Copy URL
  container.querySelectorAll(".card-copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      navigator.clipboard.writeText(url).then(() => {
        showToast("Link copied to clipboard!", "success");
      }).catch(() => {
        showToast("Failed to copy link.", "error");
      });
    });
  });

  // Edit App
  container.querySelectorAll(".card-edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const app = state.apps.find(a => a.id === btn.dataset.id);
      if (app) openAppFormModal(app);
    });
  });

  // Duplicate App
  container.querySelectorAll(".card-clone-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const original = state.apps.find(a => a.id === btn.dataset.id);
      if (!original) return;
      const clone = {
        ...original,
        id: "app-" + Date.now(),
        title: original.title + " (Copy)",
        createdAt: Date.now()
      };
      state.apps.unshift(clone);
      saveApps();
      renderCategories();
      renderApps();
      updateMetrics();
      showToast(`Duplicated "${original.title}"`, "success");
    });
  });

  // Delete App
  container.querySelectorAll(".card-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const app = state.apps.find(a => a.id === btn.dataset.id);
      if (!app) return;
      if (confirm(`Are you sure you want to delete "${app.title}"?`)) {
        state.apps = state.apps.filter(a => a.id !== app.id);
        saveApps();
        renderCategories();
        renderApps();
        updateMetrics();
        showToast(`Deleted "${app.title}"`, "info");
      }
    });
  });

  // Tag filter click
  container.querySelectorAll(".tag-pill").forEach(pill => {
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      state.activeTag = pill.dataset.tag;
      const container = document.getElementById("activeTagContainer");
      document.getElementById("activeTagName").textContent = "#" + state.activeTag;
      container.classList.remove("hidden");
      container.classList.add("flex");
      renderApps();
    });
  });
}

// Helpers for badges and icons
function getStatusBadgeHtml(status) {
  switch (status) {
    case "active":
      return `<span class="badge-status-active px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Live</span>`;
    case "beta":
      return `<span class="badge-status-beta px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">Beta</span>`;
    case "maintenance":
      return `<span class="badge-status-maintenance px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">Maint</span>`;
    case "internal":
      return `<span class="badge-status-internal px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">Internal</span>`;
    default:
      return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">Unknown</span>`;
  }
}

function getAppIconHtml(icon) {
  if (!icon) return "🚀";
  // Check if it's emoji or text
  if (icon.length <= 4) {
    return icon;
  }
  // If it's a lucide icon identifier
  return `<i data-lucide="${escapeHtml(icon)}" class="w-5 h-5 text-indigo-500"></i>`;
}

// Sorting logic
function sortApps(apps, mode) {
  const list = [...apps];
  switch (mode) {
    case "titleAsc":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "titleDesc":
      return list.sort((a, b) => b.title.localeCompare(a.title));
    case "status":
      return list.sort((a, b) => a.status.localeCompare(b.status));
    case "newest":
      return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    case "custom":
    default:
      // Pinned apps first, then default order
      return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }
}

// Update Top Metric Counters
function updateMetrics() {
  const total = state.apps.length;
  const active = state.apps.filter(a => a.status === "active").length;
  const categories = new Set(state.apps.map(a => a.category).filter(Boolean)).size;
  const pinned = state.apps.filter(a => a.pinned).length;

  document.getElementById("statTotalApps").textContent = total;
  document.getElementById("statActiveApps").textContent = active;
  document.getElementById("statCategories").textContent = categories;
  document.getElementById("statPinnedApps").textContent = pinned;
}

function applyViewModeUI() {
  const container = document.getElementById("appsContainer");
  const viewGridBtn = document.getElementById("viewGridBtn");
  const viewListBtn = document.getElementById("viewListBtn");

  if (state.viewMode === "list") {
    container.classList.add("list-view-mode");
    viewListBtn.classList.add("bg-white", "dark:bg-slate-700", "text-indigo-600", "dark:text-indigo-400", "shadow-sm");
    viewListBtn.classList.remove("text-slate-500", "dark:text-slate-400");
    viewGridBtn.classList.remove("bg-white", "dark:bg-slate-700", "text-indigo-600", "dark:text-indigo-400", "shadow-sm");
    viewGridBtn.classList.add("text-slate-500", "dark:text-slate-400");
  } else {
    container.classList.remove("list-view-mode");
    viewGridBtn.classList.add("bg-white", "dark:bg-slate-700", "text-indigo-600", "dark:text-indigo-400", "shadow-sm");
    viewGridBtn.classList.remove("text-slate-500", "dark:text-slate-400");
    viewListBtn.classList.remove("bg-white", "dark:bg-slate-700", "text-indigo-600", "dark:text-indigo-400", "shadow-sm");
    viewListBtn.classList.add("text-slate-500", "dark:text-slate-400");
  }
}

// ==================== ADMIN MODE HANDLING ====================

let pendingAdminCallback = null;

function openAdminPinModal(callback = null) {
  pendingAdminCallback = callback;
  const modal = document.getElementById("adminPinModal");
  const input = document.getElementById("adminPinInput");
  const error = document.getElementById("adminPinError");

  input.value = "";
  error.classList.add("hidden");
  modal.classList.remove("hidden");
  setTimeout(() => input.focus(), 50);
}

function closeAdminPinModal() {
  document.getElementById("adminPinModal").classList.add("hidden");
  pendingAdminCallback = null;
}

function handlePinSubmit() {
  const input = document.getElementById("adminPinInput");
  const error = document.getElementById("adminPinError");

  if (input.value === state.adminPin) {
    state.isAdmin = true;
    updateAdminUI();
    closeAdminPinModal();
    showToast("Admin Mode unlocked successfully.", "success");
    if (pendingAdminCallback) {
      pendingAdminCallback();
      pendingAdminCallback = null;
    }
  } else {
    error.classList.remove("hidden");
    input.select();
  }
}

function exitAdminMode() {
  state.isAdmin = false;
  updateAdminUI();
  showToast("Admin Mode locked.", "info");
}

function updateAdminUI() {
  const adminBtnLabel = document.getElementById("adminBtnLabel");
  const adminBadge = document.getElementById("adminBadge");
  const adminLockIcon = document.getElementById("adminLockIconContainer");
  const adminNoticeBar = document.getElementById("adminNoticeBar");

  if (state.isAdmin) {
    adminBtnLabel.textContent = "Admin Active";
    adminBadge.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
    adminLockIcon.innerHTML = `<i data-lucide="unlock" class="w-3.5 h-3.5 text-emerald-500"></i>`;
    adminNoticeBar.classList.remove("hidden");
  } else {
    adminBtnLabel.textContent = "Admin Mode";
    adminBadge.className = "w-2 h-2 rounded-full bg-slate-400";
    adminLockIcon.innerHTML = `<i data-lucide="lock" class="w-3.5 h-3.5 text-slate-500"></i>`;
    adminNoticeBar.classList.add("hidden");
  }

  // Re-render apps to show or hide edit/delete buttons
  renderApps();
}

// ==================== APP FORM MODAL (ADD / EDIT) ====================

function openAppFormModal(appToEdit = null) {
  const modal = document.getElementById("appFormModal");
  const form = document.getElementById("appForm");
  const modalTitle = document.getElementById("formModalTitle");
  const modalIcon = document.getElementById("formModalIcon");

  form.reset();

  if (appToEdit) {
    modalTitle.textContent = "Edit Application Details";
    modalIcon.setAttribute("data-lucide", "pencil");
    document.getElementById("formAppId").value = appToEdit.id;
    document.getElementById("formAppTitle").value = appToEdit.title || "";
    document.getElementById("formAppSubdomain").value = appToEdit.subdomain || "";
    document.getElementById("formAppUrl").value = appToEdit.url || "";
    document.getElementById("formAppCategory").value = appToEdit.category || "";
    document.getElementById("formAppStatus").value = appToEdit.status || "active";
    document.getElementById("formAppDescription").value = appToEdit.description || "";
    document.getElementById("formAppIcon").value = appToEdit.icon || "";
    document.getElementById("formAppTags").value = (appToEdit.tags || []).join(", ");
    document.getElementById("formAppPinned").checked = !!appToEdit.pinned;
    document.getElementById("formAppAllowPreview").checked = appToEdit.allowPreview !== false;
  } else {
    modalTitle.textContent = "Add New Application";
    modalIcon.setAttribute("data-lucide", "plus-circle");
    document.getElementById("formAppId").value = "";
    document.getElementById("formAppStatus").value = "active";
    document.getElementById("formAppIcon").value = "🚀";
    document.getElementById("formAppPinned").checked = false;
    document.getElementById("formAppAllowPreview").checked = true;
  }

  modal.classList.remove("hidden");
  refreshIcons();
}

function closeAppFormModal() {
  document.getElementById("appFormModal").classList.add("hidden");
}

function handleAppFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("formAppId").value;
  const title = document.getElementById("formAppTitle").value.trim();
  const subdomain = document.getElementById("formAppSubdomain").value.trim();
  const url = document.getElementById("formAppUrl").value.trim();
  const category = document.getElementById("formAppCategory").value.trim() || "General";
  const status = document.getElementById("formAppStatus").value;
  const description = document.getElementById("formAppDescription").value.trim();
  const icon = document.getElementById("formAppIcon").value.trim() || "🚀";
  const rawTags = document.getElementById("formAppTags").value;
  const tags = rawTags ? rawTags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];
  const pinned = document.getElementById("formAppPinned").checked;
  const allowPreview = document.getElementById("formAppAllowPreview").checked;

  if (id) {
    // Edit existing
    const index = state.apps.findIndex(a => a.id === id);
    if (index !== -1) {
      state.apps[index] = {
        ...state.apps[index],
        title,
        subdomain,
        url,
        category,
        status,
        description,
        icon,
        tags,
        pinned,
        allowPreview,
        updatedAt: Date.now()
      };
      showToast(`Updated "${title}"`, "success");
    }
  } else {
    // Add new
    const newApp = {
      id: "app-" + Date.now(),
      title,
      subdomain,
      url,
      category,
      status,
      description,
      icon,
      tags,
      pinned,
      allowPreview,
      createdAt: Date.now()
    };
    state.apps.unshift(newApp);
    showToast(`Added "${title}"`, "success");
  }

  saveApps();
  closeAppFormModal();
  renderCategories();
  renderApps();
  updateMetrics();
}

// ==================== PREVIEW MODAL ====================

function openPreviewModal(app) {
  const modal = document.getElementById("previewModal");
  const iconEl = document.getElementById("previewAppIcon");
  const titleEl = document.getElementById("previewAppTitle");
  const urlEl = document.getElementById("previewAppUrl");
  const extBtn = document.getElementById("previewExternalLinkBtn");
  const iframe = document.getElementById("previewIframe");
  const loader = document.getElementById("previewLoadingIndicator");

  iconEl.textContent = app.icon || "🚀";
  titleEl.textContent = app.title;
  urlEl.textContent = app.url;
  extBtn.href = app.url;

  loader.classList.remove("hidden");
  iframe.src = app.url;

  iframe.onload = () => {
    loader.classList.add("hidden");
  };

  modal.classList.remove("hidden");
}

function closePreviewModal() {
  const modal = document.getElementById("previewModal");
  const iframe = document.getElementById("previewIframe");
  iframe.src = "";
  modal.classList.add("hidden");
}

// ==================== BACKUP / IMPORT / EXPORT ====================

function openBackupModal(mode = "export") {
  const modal = document.getElementById("backupModal");
  const title = document.getElementById("backupModalTitle");
  const textarea = document.getElementById("backupJsonTextarea");

  if (mode === "export") {
    title.textContent = "Export Applications JSON";
    textarea.value = JSON.stringify(state.apps, null, 2);
  } else {
    title.textContent = "Import Applications JSON";
    textarea.value = "";
    textarea.placeholder = "Paste your exported JSON array here...";
  }

  modal.classList.remove("hidden");
}

function closeBackupModal() {
  document.getElementById("backupModal").classList.add("hidden");
}

function copyBackupJson() {
  const textarea = document.getElementById("backupJsonTextarea");
  navigator.clipboard.writeText(textarea.value).then(() => {
    showToast("JSON copied to clipboard!", "success");
  });
}

function applyImportedJson() {
  const textarea = document.getElementById("backupJsonTextarea");
  const text = textarea.value.trim();

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error("JSON must be an array of application objects.");
    }
    state.apps = parsed;
    saveApps();
    closeBackupModal();
    renderCategories();
    renderApps();
    updateMetrics();
    showToast(`Successfully imported ${parsed.length} applications!`, "success");
  } catch (err) {
    alert("Invalid JSON format: " + err.message);
  }
}

// ==================== GAS BACKEND SYNC ====================

function openGasSyncModal() {
  document.getElementById("gasSyncModal").classList.remove("hidden");
}

function closeGasSyncModal() {
  document.getElementById("gasSyncModal").classList.add("hidden");
}

function handleSaveGasEndpoint() {
  const input = document.getElementById("gasApiEndpointInput");
  const status = document.getElementById("gasSyncStatus");
  const url = input.value.trim();

  if (!url) {
    localStorage.removeItem(STORAGE_KEYS.GAS_ENDPOINT);
    state.gasEndpoint = "";
    status.textContent = "GAS sync endpoint cleared.";
    return;
  }

  state.gasEndpoint = url;
  localStorage.setItem(STORAGE_KEYS.GAS_ENDPOINT, url);
  status.textContent = "Endpoint saved. You can use Code.gs to read/write apps to Google Sheets.";
  showToast("GAS Endpoint URL saved.", "success");
}

// ==================== UTILITIES & HELPERS ====================

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  const colors = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-slate-800 text-white border border-slate-700"
  };

  toast.className = `toast-item pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 ${colors[type] || colors.info}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
