function doGet(e) {
  try {
    var raw = e.parameter.data;
    if (!raw) {
      return ContentService
        .createTextOutput("No data")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    var data = JSON.parse(decodeURIComponent(raw));
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheetName = "Other";
    if (data.type === "checkin") sheetName = "Check-ins";
    if (data.type === "weekly") sheetName = "Weekly";
    if (data.type === "meeting_prep") sheetName = "Meeting Prep";
    if (data.type === "plan") sheetName = "Plans";

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      addHeaders(sheet, data.type);
    }

    var row = buildRow(data);
    sheet.appendRow(row);

    return ContentService
      .createTextOutput("ok")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService
      .createTextOutput("error: " + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function addHeaders(sheet, type) {
  var headers = [];

  if (type === "checkin") {
    headers = [
      "Timestamp",
      "Date",
      "User",
      "Tasks",
      "Statuses",
      "What Happened",
      "Honest Take",
      "Claude Feedback"
    ];
  } else if (type === "weekly") {
    headers = [
      "Timestamp",
      "Date",
      "User",
      "Moved Forward",
      "Stalled",
      "Commitment",
      "Claude Feedback"
    ];
  } else if (type === "meeting_prep") {
    headers = [
      "Timestamp",
      "Date",
      "User",
      "Meeting Length",
      "What to Cover",
      "Stuck On",
      "Need From Other",
      "Claude Feedback"
    ];
  } else if (type === "plan") {
    headers = [
      "Timestamp",
      "Date",
      "User",
      "Tasks",
      "Schedule",
      "Intention"
    ];
  }

  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
}

function buildRow(data) {
  var ts = new Date().toLocaleString();

  if (data.type === "checkin") {
    return [
      ts,
      data.date,
      data.user,
      data.tasks,
      data.statuses,
      data.notes,
      data.honestTake,
      data.claudeFeedback
    ];
  }

  if (data.type === "weekly") {
    return [
      ts,
      data.date,
      data.user,
      data.moved,
      data.stalled,
      data.commitment,
      data.claudeFeedback
    ];
  }

  if (data.type === "meeting_prep") {
    return [
      ts,
      data.date,
      data.user,
      data.meetingType,
      data.cover,
      data.stuck,
      data.need,
      data.claudeFeedback
    ];
  }

  if (data.type === "plan") {
    return [
      ts,
      data.date,
      data.user,
      data.tasks,
      data.schedule,
      data.intention
    ];
  }

  return [ts, JSON.stringify(data)];
}
