const Utils = {
  jsonResponse(data, headers = {}, status = 200) {
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON)
      .setResponseCode(status)
      .setHeaders(headers);
  },

  generateToken(length = 24) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  },

  getBearerToken(headers) {
    const auth = headers['Authorization'] || headers['authorization'];
    if (!auth || !auth.startsWith("Bearer ")) return null;
    return auth.replace("Bearer ", "").trim();
  },

  saveSession(token, sdt) {
    const store = PropertiesService.getScriptProperties();
    store.setProperty(`session_${token}`, sdt);
  },

  getSessionUser(token) {
    const store = PropertiesService.getScriptProperties();
    return store.getProperty(`session_${token}`);
  },

  clearSession(token) {
    PropertiesService.getScriptProperties().deleteProperty(`session_${token}`);
  }
};
