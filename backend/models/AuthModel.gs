const AuthModel = {
  getUserByPhone(sdt) {
    const sheet = CONFIG.getSheet(CONFIG.SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const indexMap = headers.reduce((obj, h, i) => (obj[h] = i, obj), {});

    for (let i = 1; i < data.length; i++) {
      if (data[i][indexMap["sdt"]] === sdt) {
        return headers.reduce((obj, h, j) => (obj[h] = data[i][j], obj), {});
      }
    }

    return null;
  },

  validateLogin(sdt, password) {
    const user = this.getUserByPhone(sdt);
    if (!user) return null;
    if (user.password !== password) return null;
    return user;
  }
};
