// URL của API backend (thay bằng URL deployment của bạn)
const API_BASE = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

/**
 * Gửi yêu cầu POST tới backend GAS
 * @param {string} path - Đường dẫn endpoint (ví dụ: "auth/login")
 * @param {object} data - Dữ liệu body JSON
 */
async function apiPost(path, data = {}) {
  const res = await fetch(`${API_BASE}?path=${path}&method=POST`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

/**
 * Gửi yêu cầu GET tới backend GAS
 * @param {string} path - Đường dẫn endpoint (ví dụ: "users/me")
 */
async function apiGet(path) {
  const res = await fetch(`${API_BASE}?path=${path}&method=GET`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
    }
  });
  return await res.json();
}
