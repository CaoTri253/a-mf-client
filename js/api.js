const API_BASE = "https://script.google.com/macros/s/AKfycbwfsTcpgpduAP6bsQnDu1vsUTzMrtYNRMyZLsqKDJu-5j910xP69GXmdS1OaOAdKbNJ/exec"; // Đổi thành link Web App của bạn

// Hàm đăng nhập: chỉ dùng GET, không headers!
async function login(sdt, password) {
  const url = `${API_BASE}?func=Login&sdt=${encodeURIComponent(sdt)}&password=${encodeURIComponent(password)}`;
  const res = await fetch(url);
  return await res.json();
}

// Hàm đọc toàn bộ Users
async function readAllUsers() {
  const url = `${API_BASE}?func=ReadAll&SH=Users`;
  const res = await fetch(url);
  const text = await res.text();
  // Parse nếu muốn
  return text;
}
