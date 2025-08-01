const API_BASE = "https://script.google.com/macros/s/AKfycbzK034VDCfzxBhEpKYirPjZO1PnDTKZ7VZ1SxVysIIK_2fkCt5gK790hY0Qr-cD-S50/exec"; // Đổi thành link Apps Script của bạn

// Đăng nhập
async function login(sdt, password) {
  const url = `${API_BASE}?func=Login&sdt=${encodeURIComponent(sdt)}&password=${encodeURIComponent(password)}`;
  const res = await fetch(url, { method: "GET" });
  return await res.json();
}

// Đọc dữ liệu (ví dụ)
async function readAll(sheetName) {
  const url = `${API_BASE}?func=ReadAll&SH=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { method: "GET" });
  return await res.text();
}
