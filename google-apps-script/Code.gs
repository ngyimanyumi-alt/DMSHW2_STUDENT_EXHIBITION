const SHEETS = {
  cards: {
    name: "CardOverrides",
    headers: [
      "cardId",
      "nameZh",
      "nameEn",
      "keywordsZh",
      "keywordsEn",
      "descriptionZh",
      "descriptionEn",
      "artist",
      "imageUrl",
      "driveUrl",
      "updatedAt",
    ],
  },
  settings: {
    name: "ExhibitionSettings",
    headers: [
      "id",
      "titleZh",
      "titleEn",
      "statementZh",
      "statementEn",
      "updatedAt",
    ],
  },
  guestbook: {
    name: "Guestbook",
    headers: ["id", "name", "message", "photoUrl", "hidden", "createdAt"],
  },
};

function setupGalleryStorage() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Run setup from the linked spreadsheet");
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty("SPREADSHEET_ID", spreadsheet.getId());

  if (!properties.getProperty("MEDIA_FOLDER_ID")) {
    const folder = DriveApp.createFolder("Lenormand Gallery Images");
    properties.setProperty("MEDIA_FOLDER_ID", folder.getId());
  }

  Object.keys(SHEETS).forEach(function (key) {
    getSheet_(key);
  });
}

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      "API_SECRET",
    );
    if (!expectedSecret || request.secret !== expectedSecret) {
      return json_({ ok: false, error: "unauthorized" });
    }

    const data = dispatch_(request.action, request.payload || {});
    return json_({ ok: true, data: data });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: "storage_failed" });
  }
}

function dispatch_(action, payload) {
  switch (action) {
    case "getCardOverrides":
      return readRecords_("cards").map(function (row) {
        row.cardId = Number(row.cardId);
        row.updatedAt = dateIso_(row.updatedAt);
        return row;
      });
    case "saveCardTextOverride":
      return saveCard_(payload, {
        nameZh: payload.nameZh,
        nameEn: payload.nameEn,
        keywordsZh: payload.keywordsZh,
        keywordsEn: payload.keywordsEn,
        descriptionZh: payload.descriptionZh,
        descriptionEn: payload.descriptionEn,
        artist: payload.artist,
      });
    case "saveCardMedia":
      return saveCard_(payload, {
        imageUrl: payload.imageUrl,
        driveUrl: payload.driveUrl,
      });
    case "getSavedExhibitionSettings": {
      const settings = readRecords_("settings")[0];
      if (!settings) return null;
      settings.id = Number(settings.id);
      settings.updatedAt = dateIso_(settings.updatedAt);
      return settings;
    }
    case "saveExhibitionSettings":
      upsertRecord_("settings", "id", 1, payload);
      return null;
    case "getVisibleGuestbookEntries":
      return guestbookRecords_().filter(function (row) {
        return !row.hidden;
      });
    case "getAllGuestbookEntries":
      return guestbookRecords_();
    case "addGuestbookEntry":
      return addGuestbookEntry_(payload);
    case "setGuestbookEntryHidden":
      return setGuestbookEntryHidden_(payload);
    case "storeImage":
      return storeImage_(payload);
    default:
      throw new Error("unsupported_action");
  }
}

function saveCard_(payload, updates) {
  const cardId = Number(payload.cardId);
  if (!Number.isInteger(cardId) || cardId < 1 || cardId > 36) {
    throw new Error("invalid_card_id");
  }
  upsertRecord_("cards", "cardId", cardId, updates);
  return null;
}

function guestbookRecords_() {
  return readRecords_("guestbook")
    .map(function (row) {
      row.id = Number(row.id);
      row.hidden = row.hidden === true || row.hidden === "TRUE";
      row.createdAt = dateIso_(row.createdAt);
      return row;
    })
    .sort(function (left, right) {
      return (
        new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime() ||
        right.id - left.id
      );
    });
}

function addGuestbookEntry_(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const entries = readRecords_("guestbook");
    const id = entries.reduce(function (maximum, row) {
      return Math.max(maximum, Number(row.id) || 0);
    }, 0) + 1;
    const entry = {
      id: id,
      name: String(payload.name),
      message: String(payload.message),
      photoUrl: payload.photoUrl || "",
      hidden: false,
      createdAt: new Date().toISOString(),
    };
    appendRecord_("guestbook", entry);
    entry.photoUrl = entry.photoUrl || null;
    return entry;
  } finally {
    lock.releaseLock();
  }
}

function setGuestbookEntryHidden_(payload) {
  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1 || typeof payload.hidden !== "boolean") {
    throw new Error("invalid_guestbook_update");
  }
  const records = readRecords_("guestbook");
  const index = records.findIndex(function (row) {
    return Number(row.id) === id;
  });
  if (index < 0) throw new Error("guestbook_entry_not_found");
  records[index].hidden = payload.hidden;
  writeRecord_("guestbook", index + 2, records[index]);
  return null;
}

function storeImage_(payload) {
  const mimeType = String(payload.mimeType || "");
  if (
    ["image/jpeg", "image/png", "image/webp"].indexOf(mimeType) < 0 ||
    typeof payload.data !== "string"
  ) {
    throw new Error("invalid_image");
  }
  const folderId = PropertiesService.getScriptProperties().getProperty(
    "MEDIA_FOLDER_ID",
  );
  if (!folderId) throw new Error("run_setupGalleryStorage_first");

  const bytes = Utilities.base64Decode(payload.data);
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[mimeType];
  const file = DriveApp.getFolderById(folderId).createFile(
    Utilities.newBlob(bytes, mimeType, "gallery-" + Utilities.getUuid() + "." + extension),
  );
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return {
    imageUrl:
      "https://drive.google.com/uc?export=view&id=" +
      encodeURIComponent(file.getId()),
  };
}

function upsertRecord_(key, idField, id, updates) {
  const records = readRecords_(key);
  const index = records.findIndex(function (row) {
    return Number(row[idField]) === Number(id);
  });
  const current = index < 0 ? {} : records[index];
  const record = Object.assign({}, current, updates, {
    [idField]: id,
    updatedAt: new Date().toISOString(),
  });
  if (index < 0) appendRecord_(key, record);
  else writeRecord_(key, index + 2, record);
}

function appendRecord_(key, record) {
  const sheet = getSheet_(key);
  const row = sheet.getLastRow() + 1;
  writeRecord_(key, row, record);
}

function writeRecord_(key, rowNumber, record) {
  const sheet = getSheet_(key);
  const range = sheet.getRange(rowNumber, 1, 1, SHEETS[key].headers.length);
  range.setNumberFormat("@");
  range.setValues([
    SHEETS[key].headers.map(function (header) {
      return cellValue_(record[header]);
    }),
  ]);
}

function readRecords_(key) {
  const sheet = getSheet_(key);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  return values.slice(1).map(function (row) {
    const record = {};
    SHEETS[key].headers.forEach(function (header, index) {
      const value = row[index];
      record[header] = value instanceof Date ? value.toISOString() : value;
    });
    return record;
  });
}

function getSheet_(key) {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(
    "SPREADSHEET_ID",
  );
  if (!spreadsheetId || !SHEETS[key]) {
    throw new Error("run_setupGalleryStorage_first");
  }
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const definition = SHEETS[key];
  let sheet = spreadsheet.getSheetByName(definition.name);
  if (!sheet) sheet = spreadsheet.insertSheet(definition.name);
  if (sheet.getLastRow() === 0) {
    const headerRange = sheet.getRange(1, 1, 1, definition.headers.length);
    headerRange.setNumberFormat("@");
    headerRange.setValues([definition.headers]);
  }
  return sheet;
}

function cellValue_(value) {
  return value === null || value === undefined ? "" : value;
}

function dateIso_(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) throw new Error("invalid_stored_date");
  return date.toISOString();
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
