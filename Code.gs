/**
 * RKdash — Enterprise Gateway Google Sheets Database Backend (Code.gs)
 * 
 * =========================================================================
 * 📋 SETUP INSTRUCTIONS (Takes ~2 minutes):
 * =========================================================================
 * 1. Open Google Sheets (https://sheets.new) and create a new spreadsheet.
 *    Name it: "RKdash Database"
 * 2. In Google Sheets, click: Extensions > Apps Script
 * 3. Delete any default code in Code.gs and PASTE THIS ENTIRE FILE.
 * 4. Click "Deploy" (blue button at top right) > "New deployment".
 *    - Click the gear icon next to "Select type" > choose "Web app".
 *    - Description: "RKdash Gateway Database API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"  <-- (CRITICAL: Do not select "Only myself")
 * 5. Click "Deploy", review & grant permissions when prompted.
 * 6. Copy the resulting "Web app URL" (it ends with /exec).
 * 7. In RKdash (https://rkdash.in), open Admin Console > "Database & Cloud Sync",
 *    paste your Web app URL, and click "Save & Connect"!
 * 
 * That's it! Every time you add, edit, reorder, or delete cards, they are
 * instantly saved to your Google Sheet and reflected live for all visitors.
 * =========================================================================
 */

const SHEET_SERVICES = "Services";
const SHEET_SECURITY = "Security";

// Default seed services if the spreadsheet is brand new
const INITIAL_SERVICES = [
  {
    id: "srv-001",
    title: "Automated Billing & Invoicing Engine",
    subdomain: "billing.rkdash.in",
    targetUrl: "https://billing.rkdash.in",
    description: "Automated GST/VAT compliance, real-time invoice generation, and tax-ready financial ledger syncing.",
    order: 1,
    status: "live",
    category: "Finance",
    icon: "chart",
    color: "from-emerald-600 to-teal-700",
    version: "v3.2"
  },
  {
    id: "srv-002",
    title: "People & HR Operations Portal",
    subdomain: "people.rkdash.in",
    targetUrl: "https://people.rkdash.in",
    description: "Central employee directory, leave management workflows, multi-tier approvals, and attendance tracking.",
    order: 2,
    status: "live",
    category: "HR & Operations",
    icon: "shield",
    color: "from-indigo-600 to-blue-700",
    version: "v2.5"
  },
  {
    id: "srv-003",
    title: "Logistics & Asset Telemetry Hub",
    subdomain: "logistics.rkdash.in",
    targetUrl: "https://logistics.rkdash.in",
    description: "Real-time supply chain asset tracking, QR/barcode scanning, warehouse inventory, and automated reorder alerts.",
    order: 3,
    status: "testing",
    category: "Operations",
    icon: "building",
    color: "from-amber-500 to-orange-700",
    version: "v1.8-beta"
  },
  {
    id: "srv-004",
    title: "Broadcast & Campaign Dispatcher",
    subdomain: "comms.rkdash.in",
    targetUrl: "https://comms.rkdash.in",
    description: "High-throughput transactional messaging, stakeholder alerts, scheduled newsletters, and bounce telemetry.",
    order: 4,
    status: "live",
    category: "Communications",
    icon: "mail",
    color: "from-sky-500 to-blue-600",
    version: "v4.0"
  },
  {
    id: "srv-005",
    title: "Data Integration & Webhook Ingestion",
    subdomain: "webhooks.rkdash.in",
    targetUrl: "https://webhooks.rkdash.in",
    description: "Real-time webhook routing pipeline, partner API ingestion payloads, and automated event triggers.",
    order: 5,
    status: "live",
    category: "Integration",
    icon: "webhook",
    color: "from-purple-600 to-indigo-700",
    version: "v2.1"
  },
  {
    id: "srv-006",
    title: "Executive Business Intelligence & KPIs",
    subdomain: "analytics.rkdash.in",
    targetUrl: "https://analytics.rkdash.in",
    description: "Consolidated monthly enterprise analytics, cross-department scorecards, and predictive executive dashboards.",
    order: 6,
    status: "testing",
    category: "Analytics",
    icon: "chart",
    color: "from-cyan-600 to-teal-700",
    version: "v1.4"
  },
  {
    id: "srv-007",
    title: "Security & Audit Vigilance Console",
    subdomain: "security.rkdash.in",
    targetUrl: "https://security.rkdash.in",
    description: "Confidential administrative audit trails, IAM permissions governance, zero-trust telemetry, and incident response.",
    order: 7,
    status: "restricted",
    category: "Governance",
    icon: "lock",
    color: "from-rose-600 to-red-800",
    version: "v2.0"
  },
  {
    id: "srv-008",
    title: "Digital Document Automation & Vault",
    subdomain: "docs.rkdash.in",
    targetUrl: "https://docs.rkdash.in",
    description: "Cryptographically stamped contracts, digital signature dispatch, and immutable cloud storage archiving.",
    order: 8,
    status: "live",
    category: "Utilities",
    icon: "file-text",
    color: "from-emerald-600 to-teal-800",
    version: "v3.1"
  }
];

/**
 * Handle HTTP GET Requests
 * Supports:
 * - ?action=getCatalog (returns current services)
 * - ?action=getAuth (returns auth hashes)
 * - ?action=saveCatalog&payload=... (fallback GET-based save)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getCatalog";

  // Check health / test
  if (action === "ping") {
    return createJsonResponse({ status: "success", message: "RKdash Database Connected", timestamp: Date.now() });
  }

  // Retrieve Catalog
  if (action === "getCatalog") {
    var catalog = getCatalogFromSheet();
    return createJsonResponse({ status: "success", data: catalog, timestamp: Date.now() });
  }

  // Retrieve Auth
  if (action === "getAuth") {
    var auth = getAuthFromSheet();
    return createJsonResponse({ status: "success", data: auth, timestamp: Date.now() });
  }

  // Fallback GET-based catalog save
  if (action === "saveCatalog" && e.parameter.payload) {
    try {
      var services = JSON.parse(decodeURIComponent(e.parameter.payload));
      saveCatalogToSheet(services);
      return createJsonResponse({ status: "success", count: services.length, timestamp: Date.now() });
    } catch (err) {
      return createJsonResponse({ status: "error", message: err.toString() });
    }
  }

  return createJsonResponse({
    status: "success",
    message: "RKdash Enterprise Gateway Sheets API is online",
    availableActions: ["getCatalog", "getAuth", "saveCatalog", "ping"]
  });
}

/**
 * Handle HTTP POST Requests
 * Accepts JSON payload with { action: "saveCatalog", services: [...] } or { action: "saveAuth", auth: {...} }
 */
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var action = body.action || "saveCatalog";

    // Save Services
    if (action === "saveCatalog") {
      var services = body.services || body.apps || [];
      if (typeof services === "string") {
        services = JSON.parse(services);
      }
      saveCatalogToSheet(services);
      return createJsonResponse({ status: "success", count: services.length, timestamp: Date.now() });
    }

    // Save Auth
    if (action === "saveAuth") {
      var authData = body.auth || body;
      saveAuthToSheet(authData);
      return createJsonResponse({ status: "success", timestamp: Date.now() });
    }

    return createJsonResponse({ status: "error", message: "Unknown action: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    return null;
  }
}

function getCatalogFromSheet() {
  var ss = getSpreadsheet();
  if (!ss) return INITIAL_SERVICES;

  var sheet = ss.getSheetByName(SHEET_SERVICES);
  if (!sheet) {
    return initServicesSheet(ss);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return initServicesSheet(ss);
  }

  var services = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue; // Skip blank rows
    services.push({
      id: String(row[0] || ("srv-" + i)),
      title: String(row[1] || ""),
      subdomain: String(row[2] || ""),
      targetUrl: String(row[3] || ""),
      description: String(row[4] || ""),
      order: Number(row[5]) || i,
      status: String(row[6] || "live").toLowerCase(),
      category: String(row[7] || "General"),
      icon: String(row[8] || "chart"),
      color: String(row[9] || "from-indigo-600 to-sky-600"),
      version: String(row[10] || "v1.0")
    });
  }

  return services.sort(function(a, b) { return a.order - b.order; });
}

function initServicesSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_SERVICES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SERVICES);
  } else {
    sheet.clear();
  }

  var headers = ['ID', 'Title', 'Subdomain', 'TargetUrl', 'Description', 'Order', 'Status', 'Category', 'Icon', 'Color', 'Version'];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0f172a')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  var rows = INITIAL_SERVICES.map(function(s) {
    return [
      s.id,
      s.title,
      s.subdomain || "",
      s.targetUrl || "",
      s.description || "",
      s.order,
      s.status,
      s.category,
      s.icon,
      s.color,
      s.version || "v1.0"
    ];
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return INITIAL_SERVICES;
}

function saveCatalogToSheet(services) {
  var ss = getSpreadsheet();
  if (!ss) return;

  var sheet = ss.getSheetByName(SHEET_SERVICES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SERVICES);
  }

  sheet.clearContents();
  var headers = ['ID', 'Title', 'Subdomain', 'TargetUrl', 'Description', 'Order', 'Status', 'Category', 'Icon', 'Color', 'Version'];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0f172a')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  if (!services || services.length === 0) return;

  var rows = services.map(function(s, idx) {
    return [
      s.id || ("srv-" + (idx + 1)),
      s.title || "",
      s.subdomain || "",
      s.targetUrl || "",
      s.description || "",
      Number(s.order) || (idx + 1),
      s.status || "live",
      s.category || "General",
      s.icon || "chart",
      s.color || "from-indigo-600 to-sky-600",
      s.version || "v1.0"
    ];
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function getAuthFromSheet() {
  var ss = getSpreadsheet();
  if (!ss) return null;
  var sheet = ss.getSheetByName(SHEET_SECURITY);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  var row = data[1];
  return {
    username: String(row[0] || "admin"),
    passwordHash: String(row[1] || ""),
    recoveryKey: String(row[2] || ""),
    recoveryKeyHash: String(row[3] || ""),
    securityQuestion: String(row[4] || ""),
    securityAnswerHash: String(row[5] || ""),
    updatedAt: Number(row[6]) || Date.now()
  };
}

function saveAuthToSheet(auth) {
  var ss = getSpreadsheet();
  if (!ss) return;
  var sheet = ss.getSheetByName(SHEET_SECURITY);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SECURITY);
  }
  sheet.clearContents();
  var headers = ['Username', 'PasswordHash', 'RecoveryKey', 'RecoveryKeyHash', 'SecurityQuestion', 'SecurityAnswerHash', 'UpdatedAt'];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0f172a')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  sheet.appendRow([
    auth.username || "admin",
    auth.passwordHash || "",
    auth.recoveryKey || "",
    auth.recoveryKeyHash || "",
    auth.securityQuestion || "",
    auth.securityAnswerHash || "",
    Date.now()
  ]);
}
