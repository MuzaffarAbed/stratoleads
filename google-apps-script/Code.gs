/**
 * STRATO convention lead and business-card web app.
 * Opens the spreadsheet from the LEADS_SHEET_URL script property.
 * Authenticates every request with the SHARED_SECRET script property.
 * Leads are appended to the Leads tab. This script does not send email.
 * Product options must stay identical to lib/constants.ts.
 */

var PRODUCT_INTERESTS = ["STRATOPOD", "STRATOPOD GO", "STRATOWM", "STRATOOB", "Other"];

var LEAD_HEADERS = [
  "SubmittedAt",
  "SubmissionId",
  "Name",
  "Surname",
  "CompanyName",
  "CellNumber",
  "EmailAddress",
  "ProductInterest",
  "Comment",
  "Source",
];

var CARD_HEADERS = [
  "Id",
  "Slug",
  "FirstName",
  "Surname",
  "JobTitle",
  "CompanyName",
  "WorkEmail",
  "MobilePhone",
  "OfficePhone",
  "Website",
  "LinkedInUrl",
  "Location",
  "ProfileImageUrl",
  "IsActive",
  "CreatedAt",
  "UpdatedAt",
];

function doGet() {
  return json({ ok: false, code: "method_not_allowed" });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, code: "invalid_json" });
    }
    var body = JSON.parse(e.postData.contents);
    if (!secretsMatch(body && body.secret)) {
      return json({ ok: false, code: "unauthorized" });
    }
    var handlers = {
      createLead: createLead,
      listPublicCards: listPublicCards,
      getPublicCard: getPublicCard,
      adminListCards: adminListCards,
      adminCreateCard: adminCreateCard,
      adminUpdateCard: adminUpdateCard,
      adminDeactivateCard: adminDeactivateCard,
    };
    if (!handlers[body.operation]) {
      return json({ ok: false, code: "unknown_operation" });
    }
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      return handlers[body.operation](body);
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    var code = "error";
    if (error && typeof error.code === "string" && /^[a-z0-9_]+$/.test(error.code)) {
      code = error.code;
    }
    return json({ ok: false, code: code });
  }
}

function createLead(body) {
  var ss = spreadsheet();
  var sheet = ss.getSheetByName("Leads");
  if (!sheet) return json({ ok: false, code: "sheet_missing" });
  var map = headerIndex(sheet);
  if (!hasHeaders(map, LEAD_HEADERS)) return json({ ok: false, code: "headers_invalid" });

  var lead = body.lead || {};
  var submissionId = String(body.submissionId || "").trim();
  var source = clip(String(body.source || "STRATO Convention"), 80);
  var invalid = validateLead(lead, submissionId);
  if (invalid) return json({ ok: false, code: invalid });

  var normalized = normalizeLead(lead);
  var existingRow = findRow(sheet, map.SubmissionId, submissionId);
  if (existingRow > 0) {
    logOp(ss, "createLead", submissionId, "duplicate", "existing submission");
    return json({ ok: true, leadSaved: true, duplicate: true });
  }

  var submittedAt = new Date().toISOString();
  var values = {
    SubmittedAt: submittedAt,
    SubmissionId: submissionId,
    Name: safeCell(normalized.name),
    Surname: safeCell(normalized.surname),
    CompanyName: safeCell(normalized.companyName),
    CellNumber: safeCell(normalized.cellNumber),
    EmailAddress: safeCell(normalized.emailAddress),
    ProductInterest: normalized.productInterest,
    Comment: safeCell(normalized.comment),
    Source: safeCell(source),
  };
  sheet.appendRow(LEAD_HEADERS.map(function (header) { return values[header]; }));
  logOp(ss, "createLead", submissionId, "saved", "lead saved");
  return json({ ok: true, leadSaved: true, duplicate: false });
}

function listPublicCards() {
  var cards = readCards().filter(function (item) { return item.card.isActive; });
  return json({
    ok: true,
    cards: cards.map(function (item) { return publicCard(item.card); }),
  });
}

function getPublicCard(body) {
  var slug = String(body.slug || "").trim().toLowerCase();
  var match = readCards().filter(function (item) {
    return item.card.slug === slug && item.card.isActive;
  })[0];
  return json({ ok: true, card: match ? publicCard(match.card) : null });
}

function adminListCards() {
  return json({
    ok: true,
    cards: readCards().map(function (item) { return item.card; }),
  });
}

function adminCreateCard(body) {
  var card = body.card || {};
  var invalid = validateCard(card, true);
  if (invalid) return json({ ok: false, code: invalid });
  var normalized = normalizeCard(card);
  var existing = readCards();
  if (slugTaken(existing, normalized.slug, "")) {
    return json({ ok: false, code: "slug_taken" });
  }
  var now = new Date().toISOString();
  normalized.createdAt = now;
  normalized.updatedAt = now;
  var sheet = spreadsheet().getSheetByName("BusinessCards");
  sheet.appendRow(cardRow(normalized));
  logOp(spreadsheet(), "adminCreateCard", normalized.id, "saved", "card created");
  return json({ ok: true, card: normalized });
}

function adminUpdateCard(body) {
  var card = body.card || {};
  var invalid = validateCard(card, true);
  if (invalid) return json({ ok: false, code: invalid });
  var normalized = normalizeCard(card);
  var sheet = spreadsheet().getSheetByName("BusinessCards");
  var existing = readCards();
  var current = existing.filter(function (item) { return item.card.id === normalized.id; })[0];
  if (!current) return json({ ok: false, code: "not_found" });
  if (slugTaken(existing, normalized.slug, normalized.id)) {
    return json({ ok: false, code: "slug_taken" });
  }
  normalized.createdAt = current.card.createdAt;
  normalized.updatedAt = new Date().toISOString();
  writeCardRow(sheet, current.rowNumber, normalized);
  logOp(spreadsheet(), "adminUpdateCard", normalized.id, "saved", "card updated");
  return json({ ok: true, card: normalized });
}

function adminDeactivateCard(body) {
  var id = String(body.id || "").trim();
  if (!id) return json({ ok: false, code: "not_found" });
  var sheet = spreadsheet().getSheetByName("BusinessCards");
  var current = readCards().filter(function (item) { return item.card.id === id; })[0];
  if (!current) return json({ ok: false, code: "not_found" });
  var card = current.card;
  card.isActive = false;
  card.updatedAt = new Date().toISOString();
  writeCardRow(sheet, current.rowNumber, card);
  logOp(spreadsheet(), "adminDeactivateCard", id, "saved", "card deactivated");
  return json({ ok: true, card: card });
}

function validateLead(lead, submissionId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
    return "invalid_submission";
  }
  if (!textOk(lead.name, 1, 80)) return "invalid_name";
  if (!textOk(lead.surname, 1, 80)) return "invalid_surname";
  if (!textOk(lead.companyName, 1, 120)) return "invalid_company";
  if (!phoneOk(lead.cellNumber)) return "invalid_phone";
  if (!emailOk(lead.emailAddress)) return "invalid_email";
  if (PRODUCT_INTERESTS.indexOf(lead.productInterest) === -1) return "invalid_product";
  var comment = String(lead.comment || "").trim();
  if (comment.length > 1000) return "invalid_comment";
  if (lead.productInterest === "Other" && comment.length === 0) return "comment_required";
  return "";
}

function validateCard(card, requireId) {
  if (requireId && !textOk(card.id, 1, 80)) return "invalid_id";
  if (!textOk(card.firstName, 1, 80)) return "invalid_name";
  if (!textOk(card.surname, 1, 80)) return "invalid_surname";
  if (!textOk(card.jobTitle, 1, 120)) return "invalid_title";
  if (!textOk(card.companyName, 1, 160)) return "invalid_company";
  if (!emailOk(card.workEmail)) return "invalid_email";
  if (!phoneOk(card.mobilePhone)) return "invalid_phone";
  if (!optionalPhoneOk(card.officePhone)) return "invalid_office_phone";
  if (!optionalHttpsOk(card.website)) return "invalid_website";
  if (!optionalLinkedInOk(card.linkedInUrl)) return "invalid_linkedin";
  if (String(card.location || "").trim().length > 160) return "invalid_location";
  if (!optionalHttpsOk(card.profileImageUrl)) return "invalid_image";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(card.slug || "").trim().toLowerCase())) return "invalid_slug";
  if (typeof card.isActive !== "boolean") return "invalid_active";
  return "";
}

function normalizeLead(lead) {
  return {
    name: collapse(lead.name),
    surname: collapse(lead.surname),
    companyName: collapse(lead.companyName),
    cellNumber: collapse(lead.cellNumber),
    emailAddress: String(lead.emailAddress || "").trim().toLowerCase(),
    productInterest: lead.productInterest,
    comment: collapse(lead.comment || ""),
  };
}

function normalizeCard(card) {
  return {
    id: String(card.id).trim(),
    slug: String(card.slug).trim().toLowerCase(),
    firstName: collapse(card.firstName),
    surname: collapse(card.surname),
    jobTitle: collapse(card.jobTitle),
    companyName: collapse(card.companyName),
    workEmail: String(card.workEmail).trim().toLowerCase(),
    mobilePhone: collapse(card.mobilePhone),
    officePhone: optionalText(card.officePhone),
    website: optionalText(card.website),
    linkedInUrl: optionalText(card.linkedInUrl),
    location: optionalText(card.location),
    profileImageUrl: optionalText(card.profileImageUrl),
    isActive: card.isActive === true,
    createdAt: asIso(card.createdAt),
    updatedAt: asIso(card.updatedAt),
  };
}

function publicCard(card) {
  return {
    id: card.id,
    slug: card.slug,
    firstName: card.firstName,
    surname: card.surname,
    jobTitle: card.jobTitle,
    companyName: card.companyName,
    workEmail: card.workEmail,
    mobilePhone: card.mobilePhone,
    officePhone: card.officePhone,
    website: card.website,
    linkedInUrl: card.linkedInUrl,
    location: card.location,
    profileImageUrl: card.profileImageUrl,
    isActive: true,
  };
}

function readCards() {
  var sheet = spreadsheet().getSheetByName("BusinessCards");
  if (!sheet) return [];
  var map = headerIndex(sheet);
  if (!hasHeaders(map, CARD_HEADERS)) return [];
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
  var cards = [];
  for (var i = 0; i < rows.length; i++) {
    var card = cardFromRow(rows[i], map);
    if (card && card.id) cards.push({ rowNumber: i + 2, card: card });
  }
  return cards;
}

function cardFromRow(row, map) {
  return normalizeCard({
    id: cell(row, map.Id),
    slug: cell(row, map.Slug),
    firstName: cell(row, map.FirstName),
    surname: cell(row, map.Surname),
    jobTitle: cell(row, map.JobTitle),
    companyName: cell(row, map.CompanyName),
    workEmail: cell(row, map.WorkEmail),
    mobilePhone: cell(row, map.MobilePhone),
    officePhone: cell(row, map.OfficePhone),
    website: cell(row, map.Website),
    linkedInUrl: cell(row, map.LinkedInUrl),
    location: cell(row, map.Location),
    profileImageUrl: cell(row, map.ProfileImageUrl),
    isActive: isActiveValue(row[map.IsActive]),
    createdAt: row[map.CreatedAt],
    updatedAt: row[map.UpdatedAt],
  });
}

function cardRow(card) {
  return [
    card.id,
    card.slug,
    safeCell(card.firstName),
    safeCell(card.surname),
    safeCell(card.jobTitle),
    safeCell(card.companyName),
    safeCell(card.workEmail),
    safeCell(card.mobilePhone),
    safeCell(card.officePhone || ""),
    safeCell(card.website || ""),
    safeCell(card.linkedInUrl || ""),
    safeCell(card.location || ""),
    safeCell(card.profileImageUrl || ""),
    card.isActive === true,
    card.createdAt,
    card.updatedAt,
  ];
}

function writeCardRow(sheet, rowNumber, card) {
  var values = cardRow(card);
  sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
}

function logOp(ss, operation, referenceId, status, safeMessage) {
  var sheet = ss.getSheetByName("SystemLog");
  if (!sheet) {
    sheet = ss.insertSheet("SystemLog");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Operation", "ReferenceId", "Status", "SafeMessage"]);
  }
  sheet.appendRow([new Date().toISOString(), operation, referenceId, status, safeMessage]);
}

function secretsMatch(provided) {
  var expected = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET") || "";
  var actual = String(provided || "");
  if (!expected || !actual || expected.length !== actual.length) return false;
  var mismatch = 0;
  for (var i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return mismatch === 0;
}

function spreadsheet() {
  var url = String(PropertiesService.getScriptProperties().getProperty("LEADS_SHEET_URL") || "").trim();
  var match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw { code: "sheet_url_missing" };
  }
  return SpreadsheetApp.openById(match[1]);
}

function headerIndex(sheet) {
  var width = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    map[String(headers[i]).trim()] = i;
  }
  return map;
}

function hasHeaders(map, required) {
  for (var i = 0; i < required.length; i++) {
    if (map[required[i]] === undefined) return false;
  }
  return true;
}

function findRow(sheet, columnIndex, value) {
  var last = sheet.getLastRow();
  if (last < 2 || columnIndex === undefined) return -1;
  var values = sheet.getRange(2, columnIndex + 1, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === value) return i + 2;
  }
  return -1;
}

function slugTaken(cards, slug, exceptId) {
  return cards.some(function (item) {
    return item.card.slug === slug && item.card.id !== exceptId;
  });
}

function cell(row, index) {
  if (index === undefined) return "";
  var value = row[index];
  if (value instanceof Date) return value.toISOString();
  var text = value == null ? "" : String(value);
  return text.charAt(0) === "'" ? text.slice(1) : text;
}

function asIso(value) {
  if (value instanceof Date) return value.toISOString();
  return String(value || "");
}

function isActiveValue(value) {
  return value === true || String(value).toLowerCase() === "true";
}

function safeCell(value) {
  var text = String(value == null ? "" : value);
  if (/^[=+\-@]/.test(text)) return "'" + text;
  return text;
}

function collapse(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function optionalText(value) {
  var text = collapse(value);
  return text;
}

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

function textOk(value, min, max) {
  var text = collapse(value);
  return text.length >= min && text.length <= max;
}

function phoneOk(value) {
  var text = String(value || "").trim();
  if (!/^\+?[0-9][0-9\s().-]{6,30}$/.test(text)) return false;
  var digits = text.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function optionalPhoneOk(value) {
  if (!String(value || "").trim()) return true;
  return phoneOk(value);
}

function emailOk(value) {
  var text = String(value || "").trim();
  return text.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function optionalHttpsOk(value) {
  var text = String(value || "").trim();
  if (!text) return true;
  return /^https:\/\/[^\s]+$/i.test(text) && text.length <= 400;
}

function optionalLinkedInOk(value) {
  var text = String(value || "").trim();
  if (!text) return true;
  if (!/^https:\/\/([a-z0-9-]+\.)*linkedin\.com\/[^\s]+$/i.test(text)) return false;
  return text.length <= 400;
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
