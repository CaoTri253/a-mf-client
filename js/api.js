// Địa chỉ Google Apps Script Web App
const API_BASE = "https://script.google.com/macros/s/AKfycbzK034VDCfzxBhEpKYirPjZO1PnDTKZ7VZ1SxVysIIK_2fkCt5gK790hY0Qr-cD-S50/exec";

// Hàm đăng nhập dùng GET, KHÔNG headers, KHÔNG body, KHÔNG POST!
async function login(sdt, password) {
  const url = `${API_BASE}?func=Login&sdt=${encodeURIComponent(sdt)}&password=${encodeURIComponent(password)}`;
  const res = await fetch(url); // Simple GET, không header!
  return await res.json();
}

// Hàm đọc toàn bộ dữ liệu (ví dụ)
async function readAll(sheetName) {
  const url = `${API_BASE}?func=ReadAll&SH=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  return await res.text();
}
