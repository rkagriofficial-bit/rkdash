/**
 * RKdash — Google Apps Script Backend Web App
 * 
 * Instructions:
 * 1. Open https://script.google.com and create a new project named "RKdash".
 * 2. Paste this code into "Code.gs".
 * 3. Create an HTML file in GAS named "index.html" and paste the contents of RKdash's index.html.
 * 4. Deploy > New Deployment > Type: Web App.
 *    - Execute as: Me
 *    - Who has access: Anyone with Google account (or Anyone)
 * 5. Open the Web App URL to run RKdash directly from Google's Cloud infrastructure!
 */

function doGet(e) {
  var html = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('RKdash | Google Apps Script Applications Hub')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}

/**
 * Optional Google Sheets synchronization endpoint
 * If you want to persist the catalog in a Google Sheet instead of browser localStorage.
 */
function getAppsFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RKdashApps');
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var apps = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    apps.push({
      id: row[0],
      title: row[1],
      subdomain: row[2],
      targetUrl: row[3],
      description: row[4],
      order: Number(row[5]) || (i),
      status: row[6] || 'live',
      category: row[7] || 'General',
      icon: row[8] || 'chart',
      color: row[9] || 'from-indigo-600 to-sky-600'
    });
  }
  return apps;
}

function saveAppsToSheet(appsJsonString) {
  var apps = JSON.parse(appsJsonString);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RKdashApps');
  if (!sheet) {
    sheet = ss.insertSheet('RKdashApps');
    sheet.appendRow(['ID', 'Title', 'Subdomain', 'TargetUrl', 'Description', 'Order', 'Status', 'Category', 'Icon', 'Color']);
  } else {
    sheet.clearContents();
    sheet.appendRow(['ID', 'Title', 'Subdomain', 'TargetUrl', 'Description', 'Order', 'Status', 'Category', 'Icon', 'Color']);
  }
  
  var rows = apps.map(function(app) {
    return [
      app.id,
      app.title,
      app.subdomain || '',
      app.targetUrl,
      app.description,
      app.order,
      app.status,
      app.category,
      app.icon,
      app.color || 'from-indigo-600 to-sky-600'
    ];
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  return { success: true, count: rows.length };
}
