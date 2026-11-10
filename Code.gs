/**
 * CLUSTER Community Society — Google Apps Script Webhook
 * Syncs student membership applications from the website to Google Sheets in real-time.
 * 
 * Setup Instructions:
 * 1. Open your target Google Sheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Replace all code with this file.
 * 4. Click Deploy -> New deployment -> Select type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste it into the CLUSTER Admin Panel under Applications -> Connect Google Sheet.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row on row 1 if sheet is empty (14 columns)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Application ID", "Full Name", "Email", "Roll Number", 
        "Course", "Branch", "Year", "Domain / Tracks", 
        "GitHub", "LinkedIn", "Projects (Built/Shipped)", "Motivation", "Status"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#C6FF4D").setFontColor("#000000");
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // ── SECURITY: OPTIONAL WEBHOOK SECRET TOKEN CHECK ──
    var configuredSecret = PropertiesService.getScriptProperties().getProperty("CLUSTER_WEBHOOK_SECRET");
    if (configuredSecret && data.secret !== configuredSecret) {
      return ContentService.createTextOutput(JSON.stringify({ result: "error", error: "Unauthorized: Invalid secret token" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Neutralize spreadsheet formula injection (=, +, -, @, \t, \r)
    function sanitizeCell(val) {
      var str = (val || "").toString();
      var c = str.charAt(0);
      if (c === '=' || c === '+' || c === '-' || c === '@' || c === '\t' || c === '\r') {
        return "'" + str;
      }
      return str;
    }

    // ── CASE 1: UPDATE STATUS OF AN EXISTING CANDIDATE ──
    if (data.action === "UPDATE_STATUS" && data.status) {
      var targetId = (data.id || data.applicationId || "").toString().trim().toLowerCase();
      var targetEmail = (data.email || "").toString().trim().toLowerCase();
      var targetRoll = (data.rollNumber || data.roll_number || "").toString().trim().toLowerCase();
      var lastRow = sheet.getLastRow();

      if (lastRow > 1) {
        var numCols = Math.min(sheet.getLastColumn(), 14);
        var range = sheet.getRange(2, 1, lastRow - 1, numCols);
        var values = range.getValues();
        var foundRow = -1;

        for (var i = 0; i < values.length; i++) {
          // Check Column 2 (Application ID), Column 3/4 (Email), Column 4/5 (Roll Number)
          var rowId = (values[i][1] || "").toString().trim().toLowerCase();
          var rowEmail = (values[i][3] || values[i][2] || "").toString().trim().toLowerCase();
          var rowRoll = (values[i][4] || values[i][3] || "").toString().trim().toLowerCase();
          
          if ((targetId && rowId === targetId) || (targetEmail && rowEmail === targetEmail) || (targetRoll && rowRoll === targetRoll)) {
            foundRow = i + 2;
            break;
          }
        }

        if (foundRow > 0) {
          // Status column: Column 14 (or last column if older 13-col format)
          var statusCol = numCols >= 14 ? 14 : numCols;
          var statusCell = sheet.getRange(foundRow, statusCol);
          statusCell.setValue(sanitizeCell(data.status));
          
          // Color-code status cell in Google Sheet
          if (data.status === "Accepted") {
            statusCell.setBackground("#C6FF4D").setFontColor("#000000").setFontWeight("bold");
          } else if (data.status === "Rejected") {
            statusCell.setBackground("#FFCDD2").setFontColor("#B71C1C").setFontWeight("bold");
          } else if (data.status === "Under Review") {
            statusCell.setBackground("#E1F5FE").setFontColor("#0277BD").setFontWeight("bold");
          } else if (data.status === "Waitlisted") {
            statusCell.setBackground("#EDE7F6").setFontColor("#512DA8").setFontWeight("bold");
          } else {
            statusCell.setBackground("#FFF9C4").setFontColor("#F57F17").setFontWeight("bold");
          }

          return ContentService.createTextOutput(JSON.stringify({ result: "success", action: "status_updated" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // ── CASE 2: NEW APPLICATION INSERT (14 Columns including Application ID) ──
    sheet.appendRow([
      new Date(),
      sanitizeCell(data.id || data.applicationId || "app-" + Date.now()),
      sanitizeCell(data.fullName || data.full_name),
      sanitizeCell(data.email),
      sanitizeCell(data.rollNumber || data.roll_number),
      sanitizeCell(data.course),
      sanitizeCell(data.branch),
      sanitizeCell(data.year),
      sanitizeCell(data.domain),
      sanitizeCell(data.github),
      sanitizeCell(data.linkedin),
      sanitizeCell(data.projects),
      sanitizeCell(data.motivation),
      sanitizeCell(data.status || "Pending")
    ]);

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([new Date(), "ERROR: " + error.toString()]);
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Open your Web App URL in browser to test if it is reachable!
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "ok", 
    service: "CLUSTER Google Sheets Webhook", 
    version: "2.1.0",
    columns: ["Timestamp", "Application ID", "Full Name", "Email", "Roll Number", "Course", "Branch", "Year", "Domain", "GitHub", "LinkedIn", "Projects", "Motivation", "Status"],
    timestamp: new Date().toISOString() 
  })).setMimeType(ContentService.MimeType.JSON);
}

