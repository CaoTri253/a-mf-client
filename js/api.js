const API_BASE = "https://script.google.com/macros/s/AKfycbzK034VDCfzxBhEpKYirPjZO1PnDTKZ7VZ1SxVysIIK_2fkCt5gK790hY0Qr-cD-S50/exec"; // <-- Điền link Apps Script API

async function apiRequest(path, method = "GET", data = null) {
  let token = localStorage.getItem("token");
  let headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  let url = `${API_BASE}?path=${encodeURIComponent(path)}&method=${method}`;
  let options = {
    method: method === "GET" ? "GET" : "POST",
    headers,
  };
  if (method !== "GET" && data) options.body = JSON.stringify(data);

  let res = await fetch(url, options);
  return res.json();
}
