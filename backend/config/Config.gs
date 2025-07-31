const CONFIG = {
  SHEET_NAMES: {
    USERS: "Users"
  },

  getSheet(name) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  }
};
