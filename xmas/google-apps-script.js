/**
 * ============================================================================
 * 🎄 XMAS FRIEND FINDER - GOOGLE APPS SCRIPT DATABASE
 * ============================================================================
 * Supports:
 * - Real-time cloud sync for all participants
 * - WhatsApp phone numbers & 4-digit secret keys
 * - Live scratch status tracking & timestamps
 * - Member Wishlists (up to 5 items per friend)
 * - Member Postal / Shipping Addresses
 * - Smart Annual Reset (Option to keep members, addresses, and wishlists)
 * ============================================================================
 */

function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var state = readStateFromSheet(sheet);
    return createJsonResponse({ status: 'success', state: state });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var contents = e.postData ? e.postData.contents : '{}';
    var payload = JSON.parse(contents);
    var action = payload.action;

    if (action === 'saveAllotment') {
      saveAllotmentToSheet(sheet, payload.state);
    } else if (action === 'markScratched') {
      markScratchedInSheet(sheet, payload.name, payload.timestamp);
    } else if (action === 'saveWishlist') {
      saveWishlistInSheet(sheet, payload.name, payload.wishlist);
    } else if (action === 'saveAddress') {
      saveAddressInSheet(sheet, payload.name, payload.address);
    } else if (action === 'finishGame') {
      setGameFinishedInSheet(sheet, payload.isFinished);
    } else if (action === 'reset') {
      smartResetSheet(sheet, payload);
    }

    var state = readStateFromSheet(sheet);
    return createJsonResponse({ status: 'success', state: state });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('XmasDraw');
  if (!sheet) {
    sheet = ss.insertSheet('XmasDraw');
    formatFreshSheet(sheet);
  } else {
    // Ensure Column 7 (Wishlist) exists
    if (sheet.getLastColumn() < 7 || sheet.getRange('G3').getValue() === '') {
      sheet.getRange('G3').setValue('Wishlist (Max 5)').setBackground('#d32f2f').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
      sheet.setColumnWidth(7, 240);
    }
    // Ensure Column 8 (Postal Address) exists
    if (sheet.getLastColumn() < 8 || sheet.getRange('H3').getValue() === '') {
      sheet.getRange('H3').setValue('Postal Address').setBackground('#d32f2f').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
      sheet.setColumnWidth(8, 260);
    }
  }
  return sheet;
}

function formatFreshSheet(sheet) {
  sheet.clear();
  
  // Title Banner
  sheet.getRange('A1:H1').merge();
  sheet.getRange('A1').setValue('🎄 Xmas Friend Finder 2026 - Secret Santa Database');
  sheet.getRange('A1').setBackground('#0f4c28').setFontColor('#fef08a').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  
  // Status Metadata Rows
  sheet.getRange('A2').setValue('Game Status:');
  sheet.getRange('B2').setValue('Draft (Not Allotted)');
  sheet.getRange('C2').setValue('Admin Excluded:');
  sheet.getRange('D2').setValue('TRUE');
  sheet.getRange('E2').setValue('Finished:');
  sheet.getRange('F2').setValue('FALSE');
  sheet.getRange('G2').setValue('Year: 2026');
  sheet.getRange('H2').setValue('Mode: Annual');
  sheet.getRange('A2:H2').setBackground('#1f2937').setFontColor('#cbd5e1').setFontSize(9).setFontWeight('bold');

  // Column Headers
  var headers = ['Member Name', 'WhatsApp Phone', 'Secret Key', 'Assigned Friend', 'Status', 'Scratched At', 'Wishlist (Max 5)', 'Postal Address'];
  sheet.getRange('A3:H3').setValues([headers]);
  sheet.getRange('A3:H3').setBackground('#d32f2f').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
  
  sheet.setColumnWidth(1, 160); // Name
  sheet.setColumnWidth(2, 150); // Phone
  sheet.setColumnWidth(3, 110); // Key
  sheet.setColumnWidth(4, 160); // Match
  sheet.setColumnWidth(5, 120); // Status
  sheet.setColumnWidth(6, 180); // Scratched At
  sheet.setColumnWidth(7, 240); // Wishlist
  sheet.setColumnWidth(8, 260); // Postal Address
}

function formatWishlistText(items) {
  if (!items || !items.length) return '';
  var valid = items.filter(function(i) { return typeof i === 'string' && i.trim().length > 0; }).slice(0, 5);
  return valid.map(function(item, idx) { return (idx + 1) + '. ' + item.trim(); }).join('\n');
}

function parseWishlistText(text) {
  if (!text) return [];
  var str = String(text).trim();
  if (!str) return [];
  var lines = str.split('\n');
  var list = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].replace(/^\d+[\.\)]\s*/, '').trim();
    if (line) list.push(line);
    if (list.length >= 5) break;
  }
  return list;
}

function saveAllotmentToSheet(sheet, state) {
  sheet.clearContents();
  formatFreshSheet(sheet);

  sheet.getRange('B2').setValue(state.isAllotted ? 'Sealed & Active' : 'Draft (Not Allotted)');
  sheet.getRange('D2').setValue(state.adminExcluded ? 'TRUE' : 'FALSE');
  sheet.getRange('F2').setValue(state.isFinished ? 'TRUE' : 'FALSE');

  var names = state.names || [];
  var rows = [];

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var phone = (state.phones && state.phones[name]) ? state.phones[name] : '';
    var key = (state.keys && state.keys[name]) ? state.keys[name] : '';
    var receiver = (state.pairs && state.pairs[name]) ? state.pairs[name] : '';
    var isScratched = (state.scratched && state.scratched[name]) ? '✅ Revealed' : '⏳ Pending';
    var scratchedAt = (state.scratchedAt && state.scratchedAt[name]) ? state.scratchedAt[name] : '';
    var wishlistText = (state.wishlists && state.wishlists[name]) ? formatWishlistText(state.wishlists[name]) : '';
    var address = (state.addresses && state.addresses[name]) ? state.addresses[name] : '';

    rows.push([name, phone, key, receiver, isScratched, scratchedAt, wishlistText, address]);
  }

  if (rows.length > 0) {
    sheet.getRange(4, 1, rows.length, 8).setValues(rows);
    sheet.getRange(4, 1, rows.length, 8).setHorizontalAlignment('center');
    sheet.getRange(4, 3, rows.length, 1).setFontFamily('Courier New').setFontWeight('bold'); // Keys
    sheet.getRange(4, 4, rows.length, 1).setFontWeight('bold').setFontColor('#15803d'); // Matches
    sheet.getRange(4, 7, rows.length, 1).setHorizontalAlignment('left').setWrap(true); // Wishlists
    sheet.getRange(4, 8, rows.length, 1).setHorizontalAlignment('left').setWrap(true); // Addresses
  }
}

function saveWishlistInSheet(sheet, name, wishlist) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) return;

  var names = sheet.getRange(4, 1, lastRow - 3, 1).getValues();
  var wishlistText = formatWishlistText(wishlist);

  for (var i = 0; i < names.length; i++) {
    if (names[i][0] === name) {
      sheet.getRange(4 + i, 7).setValue(wishlistText).setHorizontalAlignment('left').setWrap(true);
      break;
    }
  }
}

function saveAddressInSheet(sheet, name, address) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) return;

  var names = sheet.getRange(4, 1, lastRow - 3, 1).getValues();
  for (var i = 0; i < names.length; i++) {
    if (names[i][0] === name) {
      sheet.getRange(4 + i, 8).setValue(address || '').setHorizontalAlignment('left').setWrap(true);
      break;
    }
  }
}

function markScratchedInSheet(sheet, name, timestamp) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) return;

  var names = sheet.getRange(4, 1, lastRow - 3, 1).getValues();
  for (var i = 0; i < names.length; i++) {
    if (names[i][0] === name) {
      var row = 4 + i;
      sheet.getRange(row, 5).setValue('✅ Revealed').setFontColor('#15803d').setFontWeight('bold');
      sheet.getRange(row, 6).setValue(timestamp || new Date().toISOString());
      break;
    }
  }
}

function setGameFinishedInSheet(sheet, isFinished) {
  sheet.getRange('F2').setValue(isFinished ? 'TRUE' : 'FALSE');
  if (isFinished) {
    sheet.getRange('B2').setValue('Finished (All Revealed)');
  }
}

function smartResetSheet(sheet, payload) {
  var state = payload.state;
  if (!state || !payload.keepMembers) {
    sheet.clearContents();
    formatFreshSheet(sheet);
    return;
  }

  // Preserve members, addresses, and optionally wishes
  sheet.getRange('B2').setValue('Draft (Not Allotted)');
  sheet.getRange('F2').setValue('FALSE');

  var lastRow = sheet.getLastRow();
  if (lastRow >= 4) {
    // Clear Assigned Match (Col 4), Status (Col 5), Scratched At (Col 6)
    var numRows = lastRow - 3;
    sheet.getRange(4, 4, numRows, 1).setValue(''); // Clear matches
    sheet.getRange(4, 5, numRows, 1).setValue('⏳ Pending').setFontColor('#cbd5e1'); // Reset status
    sheet.getRange(4, 6, numRows, 1).setValue(''); // Clear scratch timestamps

    // Update keys if provided
    if (state.keys) {
      var names = sheet.getRange(4, 1, numRows, 1).getValues();
      for (var i = 0; i < names.length; i++) {
        var n = names[i][0];
        if (state.keys[n]) {
          sheet.getRange(4 + i, 3).setValue(state.keys[n]);
        }
      }
    }

    // If wishes should NOT be kept, clear Column 7
    if (!payload.keepWishes) {
      sheet.getRange(4, 7, numRows, 1).setValue('');
    }

    // If addresses should NOT be kept, clear Column 8
    if (!payload.keepAddresses) {
      sheet.getRange(4, 8, numRows, 1).setValue('');
    }
  }
}

function readStateFromSheet(sheet) {
  var lastRow = sheet.getLastRow();
  var isAllotted = (sheet.getRange('B2').getValue() === 'Sealed & Active' || sheet.getRange('B2').getValue() === 'Finished (All Revealed)');
  var isFinished = (sheet.getRange('F2').getValue().toString().toUpperCase() === 'TRUE');
  var adminExcluded = (sheet.getRange('D2').getValue().toString().toUpperCase() === 'TRUE');

  var names = [];
  var phones = {};
  var keys = {};
  var pairs = {};
  var scratched = {};
  var scratchedAt = {};
  var wishlists = {};
  var addresses = {};

  if (lastRow >= 4) {
    var numCols = Math.max(6, sheet.getLastColumn());
    var data = sheet.getRange(4, 1, lastRow - 3, numCols).getValues();
    for (var i = 0; i < data.length; i++) {
      var name = String(data[i][0]).trim();
      if (!name) continue;

      names.push(name);
      phones[name] = String(data[i][1] || '').trim();
      keys[name] = String(data[i][2] || '').trim();
      pairs[name] = String(data[i][3] || '').trim();
      
      var status = String(data[i][4] || '');
      scratched[name] = (status.indexOf('✅') !== -1 || status.toLowerCase().indexOf('revealed') !== -1);
      scratchedAt[name] = String(data[i][5] || '').trim();

      if (numCols >= 7) {
        wishlists[name] = parseWishlistText(data[i][6]);
      } else {
        wishlists[name] = [];
      }

      if (numCols >= 8) {
        addresses[name] = String(data[i][7] || '').trim();
      } else {
        addresses[name] = '';
      }
    }
  }

  return {
    isAllotted: isAllotted,
    isFinished: isFinished,
    adminExcluded: adminExcluded,
    names: names.length > 0 ? names : null,
    phones: phones,
    keys: keys,
    pairs: pairs,
    scratched: scratched,
    scratchedAt: scratchedAt,
    wishlists: wishlists,
    addresses: addresses
  };
}
